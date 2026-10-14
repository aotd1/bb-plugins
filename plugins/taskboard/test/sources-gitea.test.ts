import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && specifier.endsWith('.js')) {
    const url = new URL(`${specifier.slice(0, -3)}.ts`, context.parentURL);
    if (existsSync(fileURLToPath(url))) return { shortCircuit: true, url: url.href };
  }
  return nextResolve(specifier, context);
} });

const { createGiteaAdapter, parseGiteaRef, giteaStatusCategory } = await import('../sources/gitea.ts');
type TeaRunner = import('../sources/gitea.ts').TeaRunner;
const ref = 'git.example.com/team/app';
const locator = `${ref}#7`;
const bug = { id: 1, name: 'bug' };
const progress = { id: 2, name: 'status/in-progress' };
const done = { id: 3, name: 'status/done' };
function issue(number = 7) { return {
  number, title: 'A useful task', body: 'External text', state: 'open',
  html_url: `https://git.example.com/team/app/issues/${number}`,
  labels: [bug, progress], assignees: [{ login: 'alice' }], updated_at: '2026-10-14T12:00:00Z'
}; }

function fixture(overrides: { host?: string; failPatch?: boolean; badCreate?: boolean } = {}) {
  const calls: { args: string[]; stdin?: string }[] = [];
  let current = issue();
  const runner: TeaRunner = async (args, stdin) => {
    calls.push({ args, stdin });
    if (args[0] === 'logins') return JSON.stringify([{ name: 'pilot', url: `https://${overrides.host ?? 'git.example.com'}` }]);
    assert.equal(args[2], 'pilot');
    const path = args[5].split('?')[0];
    const method = args[4];
    const body = stdin ? JSON.parse(stdin) : undefined;
    if (path.endsWith('/comments')) return JSON.stringify([{ user: { login: 'bob' }, body: 'Live comment', created_at: '2026-10-14T12:01:00Z' }]);
    if (path.endsWith('/labels') && method === 'GET') return JSON.stringify([bug, progress, done]);
    if (path.endsWith('/labels') && method === 'PUT') {
      current.labels = [bug, progress, done].filter(label => body.labels.includes(label.id));
      return JSON.stringify(current.labels);
    }
    if (path.endsWith('/assignees')) return JSON.stringify([{ login: 'alice' }]);
    if (path.endsWith('/milestones')) return JSON.stringify([{ id: 4, title: 'Pilot' }]);
    if (method === 'PATCH') {
      if (overrides.failPatch) throw new Error('connection lost');
      current.state = body.state;
      return JSON.stringify(current);
    }
    if (method === 'POST') {
      if (overrides.badCreate) return '{';
      current = { ...current, title: body.title, body: body.body, labels: [bug] };
      return JSON.stringify(current);
    }
    return JSON.stringify(current);
  };
  return { calls, runner, adapter: createGiteaAdapter({ enabled: true, login: 'pilot', projectRef: ref, runner }) };
}

test('rejects malformed repositories and parses custom host ports', () => {
  assert.deepEqual(parseGiteaRef('git.example.com:3000/team/app'), { host: 'git.example.com:3000', owner: 'team', repo: 'app' });
  for (const invalid of ['', 'team/app', 'https://git.example.com/team/app', 'user@host/team/app', 'host/team/..', 'host/team/app?token=x', 'host/team/app#1', 'host/team/app/extra']) {
    assert.throws(() => parseGiteaRef(invalid), invalid);
  }
});

test('foreign issue locators are rejected before even invoking tea', async () => {
  const { adapter, calls } = fixture();
  await assert.rejects(adapter.updateStatus('git.example.com/other/app#7', '3'), /outside/u);
  await assert.rejects(adapter.get(`${ref}#0`), /outside/u);
  assert.equal(calls.length, 0);
});

test('login host mismatch cannot make an authenticated API request', async () => {
  const { adapter, calls } = fixture({ host: 'foreign.example.com' });
  await assert.rejects(adapter.get(locator), /does not match/u);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].args[0], 'logins');
});

test('supports reverse-proxy base paths without accepting an unrelated issue URL', async () => {
  const runner: TeaRunner = async args => args[0] === 'logins'
    ? JSON.stringify([{ name: 'pilot', url: 'https://git.example.com/gitea/' }])
    : JSON.stringify(issue());
  await assert.rejects(createGiteaAdapter({ enabled: true, login: 'pilot', projectRef: ref, runner }).get(locator), /outside/u);
});

test('reads all issue pages, filters pull requests and keeps comments live', async () => {
  const calls: string[][] = [];
  const runner: TeaRunner = async args => {
    calls.push(args);
    if (args[0] === 'logins') return JSON.stringify([{ name: 'pilot', url: 'https://git.example.com' }]);
    if (args[5].includes('/comments')) return '[]';
    if (!args[5].includes('?')) return JSON.stringify(issue());
    if (args[5].includes('page=2')) return JSON.stringify([issue(51)]);
    return JSON.stringify(Array.from({ length: 50 }, (_, i) => ({ ...issue(i + 1), ...(i === 1 ? { pull_request: {} } : {}) })));
  };
  const adapter = createGiteaAdapter({ enabled: true, login: 'pilot', projectRef: ref, runner });
  const list = await adapter.list();
  assert.equal(list.length, 50);
  assert.equal(list.at(-1)?.locator, `${ref}#51`);
  assert.ok(list.every(item => !('comments' in item)));
  assert.ok(calls.filter(args => args[0] === 'api').every(args => args[2] === 'pilot'));
  const live = await adapter.get(locator);
  assert.deepEqual(live.comments, []);
});

test('detail includes live comments and native assignee names', async () => {
  const { adapter } = fixture();
  const result = await adapter.get(locator);
  assert.equal(result.status, 'in-progress');
  assert.equal(result.assignee, 'alice');
  assert.equal(result.comments[0].author, 'bob');
});

test('terminal and resumed workflow moves preserve unrelated labels', async () => {
  const { adapter, calls } = fixture();
  const finished = await adapter.updateStatus(locator, '3');
  assert.equal(finished.stateCategory, 'done');
  assert.deepEqual(finished.labels, ['bug', 'status/done']);
  const resumed = await adapter.updateStatus(locator, '2');
  assert.equal(resumed.stateCategory, 'in_progress');
  assert.deepEqual(resumed.labels, ['bug', 'status/in-progress']);
  assert.deepEqual(calls.filter(call => call.args[4] === 'PATCH').map(call => JSON.parse(call.stdin!).state), ['closed', 'open']);
});

test('native Open clears workflow labels and retains ordinary labels', async () => {
  const { adapter } = fixture();
  const result = await adapter.updateStatus(locator, '__open__');
  assert.equal(result.status, 'Open');
  assert.deepEqual(result.labels, ['bug']);
  assert.equal((await adapter.statusOptions(locator)).filter(status => status.current).length, 1);
});

test('partial state write is reported without retries', async () => {
  const { adapter, calls } = fixture({ failPatch: true });
  await assert.rejects(adapter.updateStatus(locator, '3'), /may be partial/u);
  assert.equal(calls.filter(call => call.args[4] === 'PUT').length, 1);
  assert.equal(calls.filter(call => call.args[4] === 'PATCH').length, 1);
});

test('unknown status is rejected without any write', async () => {
  const { adapter, calls } = fixture();
  await assert.rejects(adapter.updateStatus(locator, '99'), /current Gitea workflow/u);
  assert.ok(calls.every(call => call.args[0] !== 'api' || call.args[4] === 'GET'));
});

const input = { title: 'Fix & test $(not a command)', description: 'Body with commas, quotes and &', destinationId: ref,
  issueType: null, statusId: '__open__', assigneeId: 'alice', priorityId: null, labelIds: ['1'], dueDate: '2026-10-21', milestoneId: '4' };

test('creation uses stdin JSON and confirms the requested assignee', async () => {
  const { adapter, calls } = fixture();
  const result = await adapter.create(input);
  assert.equal(result.item.title, input.title);
  assert.deepEqual(result.assigneeConfirmation, { confirmed: true, id: 'alice' });
  const write = calls.find(call => call.args[4] === 'POST')!;
  assert.ok(write.args.includes('@-'));
  assert.ok(!write.args.includes(input.title));
  const sent = JSON.parse(write.stdin!);
  assert.deepEqual(sent.labels, [1]);
  assert.equal(sent.milestone, 4);
  assert.equal(sent.due_date, '2026-10-21T23:59:59Z');
});

test('ambiguous creation is not retried and uses the shared uncertainty marker', async () => {
  const { adapter, calls } = fixture({ badCreate: true });
  await assert.rejects(adapter.create(input), /TASKBOARD_CREATE_OUTCOME_UNCERTAIN/u);
  assert.equal(calls.filter(call => call.args[4] === 'POST').length, 1);
});

test('metadata and creation reject foreign destinations before invoking tea', async () => {
  const { adapter, calls } = fixture();
  await assert.rejects(adapter.createMetadata({ destinationId: 'foreign/repo', issueType: null }), /outside/u);
  await assert.rejects(adapter.create({ ...input, destinationId: 'foreign/repo' }), /outside/u);
  assert.equal(calls.length, 0);
});

test('workflow taxonomy covers review and terminal stages', () => {
  assert.equal(giteaStatusCategory('status/review'), 'in_progress');
  assert.equal(giteaStatusCategory('STATUS/Done'), 'done');
  assert.equal(giteaStatusCategory('status/cancelled'), 'canceled');
  assert.equal(giteaStatusCategory('status/to_do'), 'todo');
});
