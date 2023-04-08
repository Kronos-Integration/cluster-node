import test from "ava";
import got from "got";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import { sign } from "@kronos-integration/interceptor-webhook";

import initialize from "../src/initialize.mjs";

const secret = "the secret";
let port = 3159;

test.before(async t => {
  port++;

  const config = {
    http: {
      listen: { socket: port }
    },
    "template-processor": {
      logLevel: "error"
    }
  };

  t.context.sp = new StandaloneServiceProvider(config);
  t.context.port = port;

  process.env.WEBHOOK_SECRET = secret;

  await initialize(t.context.sp);
  await t.context.sp.start();
});

test.after(async t => t.context.sp.stop());

test("get", async t => {
  const response = await got.get(
    `http://localhost:${t.context.port}/webhook`,
    {
    }
  );

  t.is(response.statusCode, 200);
  //t.deepEqual(JSON.parse(response.body), { });
});

test("request push", async t => {
  const signature = sign(Buffer.from(pushBody), secret);

  for (let i = 0; i < 1; i++) {
    const response = await got.post(
      `http://localhost:${t.context.port}/webhook`,
      {
        headers: {
          "X-Hub-Signature": signature,
          "content-type": "application/json",
          "X-GitHub-Delivery": "7453c7ec-5fa2-11e9-9af1-60fccbf37b5b",
          "X-GitHub-Event": "push"
        },
        body: pushBody
      }
    );

    t.is(response.statusCode, 200);
    t.log(response.body);
    t.deepEqual(JSON.parse(response.body), {
      pullRequests: ["github:template-tools/template-sync-hook[EMPTY]"]
    });
  }
});

test("request ping", async t => {
  const signature = sign(Buffer.from(pingBody), secret);

  const response = await got.post(
    `http://localhost:${t.context.port}/webhook`,
    {
      headers: {
        "X-Hub-Signature": signature,
        "content-type": "application/json",
        "X-GitHub-Delivery": "7453c7ec-5fa2-11e9-9af1-60fccbf37b5b",
        "X-GitHub-Event": "ping"
      },
      body: pingBody
    }
  );

  t.is(response.statusCode, 200);
  t.deepEqual(JSON.parse(response.body), { received: "ping" });
});

test("request unknown", async t => {
  const signature = sign(Buffer.from(pingBody), secret);

  try {
    const response = await got.post(
      `http://localhost:${t.context.port}/webhook`,
      {
        headers: {
          "X-Hub-Signature": signature,
          "content-type": "application/json",
          "X-GitHub-Delivery": "7453c7ec-5fa2-11e9-9af1-60fccbf37b5b",
          "X-GitHub-Event": "unknown"
        },
        body: pingBody
      }
    );
  } catch (e) {
    t.truthy(e.message.match(/code 500/));
  }
});

const pingBody = JSON.stringify({
  repository: {
    full_name: "template-tools/template-sync-hook"
  }
});

const pushBody = JSON.stringify({
  ref: "refs/heads/master",
  before: "0e19c5c2e158421ee2b2dfe0a70c29604b9d0cea",
  after: "0000000000000000000000000000000000000000",
  created: false,
  deleted: true,
  forced: false,
  base_ref: null,
  compare:
    "https://github.com/template-tools/template-sync-hook/compare/0e19c5c2e158...000000000000",
  commits: [],
  head_commit: null,
  repository: {
    id: 113093573,
    node_id: "MDEwOlJlcG9zaXRvcnkxMTMwOTM1NzM=",
    name: "template-sync-hook",
    full_name: "template-tools/template-sync-hook",
    private: false,
    owner: {
      name: "arlac77",
      email: "Markus.Felten@gmx.de",
      login: "arlac77",
      id: 158862,
      node_id: "MDQ6VXNlcjE1ODg2Mg==",
      avatar_url: "https://avatars1.githubusercontent.com/u/158862?v=4",
      gravatar_id: "",
      url: "https://api.github.com/users/arlac77",
      html_url: "https://github.com/arlac77",
      followers_url: "https://api.github.com/users/arlac77/followers",
      following_url:
        "https://api.github.com/users/arlac77/following{/other_user}",
      gists_url: "https://api.github.com/users/arlac77/gists{/gist_id}",
      starred_url:
        "https://api.github.com/users/arlac77/starred{/owner}{/repo}",
      subscriptions_url: "https://api.github.com/users/arlac77/subscriptions",
      organizations_url: "https://api.github.com/users/arlac77/orgs",
      repos_url: "https://api.github.com/users/arlac77/repos",
      events_url: "https://api.github.com/users/arlac77/events{/privacy}",
      received_events_url:
        "https://api.github.com/users/arlac77/received_events",
      type: "User",
      site_admin: false
    },
    html_url: "https://github.com/template-tools/template-sync-hook",
    description: "github hook for npm-template-sync",
    fork: false,
    url: "https://github.com/template-tools/template-sync-hook",
    forks_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/forks",
    keys_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/keys{/key_id}",
    collaborators_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/collaborators{/collaborator}",
    teams_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/teams",
    hooks_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/hooks",
    issue_events_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/issues/events{/number}",
    events_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/events",
    assignees_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/assignees{/user}",
    branches_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/branches{/branch}",
    tags_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/tags",
    blobs_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/git/blobs{/sha}",
    git_tags_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/git/tags{/sha}",
    git_refs_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/git/refs{/sha}",
    trees_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/git/trees{/sha}",
    statuses_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/statuses/{sha}",
    languages_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/languages",
    stargazers_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/stargazers",
    contributors_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/contributors",
    subscribers_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/subscribers",
    subscription_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/subscription",
    commits_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/commits{/sha}",
    git_commits_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/git/commits{/sha}",
    comments_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/comments{/number}",
    issue_comment_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/issues/comments{/number}",
    contents_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/contents/{+path}",
    compare_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/compare/{base}...{head}",
    merges_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/merges",
    archive_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/{archive_format}{/ref}",
    downloads_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/downloads",
    issues_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/issues{/number}",
    pulls_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/pulls{/number}",
    milestones_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/milestones{/number}",
    notifications_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/notifications{?since,all,participating}",
    labels_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/labels{/name}",
    releases_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/releases{/id}",
    deployments_url:
      "https://api.github.com/repos/template-tools/template-sync-hook/deployments",
    created_at: 1512420666,
    updated_at: "2019-04-15T17:18:14Z",
    pushed_at: 1555348695,
    git_url: "git://github.com/template-tools/template-sync-hook.git",
    ssh_url: "git@github.com:template-tools/template-sync-hook.git",
    clone_url: "https://github.com/template-tools/template-sync-hook.git",
    svn_url: "https://github.com/template-tools/template-sync-hook",
    homepage: "",
    size: 368,
    stargazers_count: 0,
    watchers_count: 0,
    language: "JavaScript",
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: true,
    has_pages: false,
    forks_count: 0,
    mirror_url: null,
    archived: false,
    disabled: false,
    open_issues_count: 0,
    license: {
      key: "bsd-2-clause",
      name: 'BSD 2-Clause "Simplified" License',
      spdx_id: "BSD-2-Clause",
      url: "https://api.github.com/licenses/bsd-2-clause",
      node_id: "MDc6TGljZW5zZTQ="
    },
    forks: 0,
    open_issues: 0,
    watchers: 0,
    default_branch: "master",
    stargazers: 0,
    master_branch: "master"
  },
  pusher: {
    name: "arlac77",
    email: "Markus.Felten@gmx.de"
  },
  sender: {
    login: "arlac77",
    id: 158862,
    node_id: "MDQ6VXNlcjE1ODg2Mg==",
    avatar_url: "https://avatars1.githubusercontent.com/u/158862?v=4",
    gravatar_id: "",
    url: "https://api.github.com/users/arlac77",
    html_url: "https://github.com/arlac77",
    followers_url: "https://api.github.com/users/arlac77/followers",
    following_url:
      "https://api.github.com/users/arlac77/following{/other_user}",
    gists_url: "https://api.github.com/users/arlac77/gists{/gist_id}",
    starred_url: "https://api.github.com/users/arlac77/starred{/owner}{/repo}",
    subscriptions_url: "https://api.github.com/users/arlac77/subscriptions",
    organizations_url: "https://api.github.com/users/arlac77/orgs",
    repos_url: "https://api.github.com/users/arlac77/repos",
    events_url: "https://api.github.com/users/arlac77/events{/privacy}",
    received_events_url: "https://api.github.com/users/arlac77/received_events",
    type: "User",
    site_admin: false
  }
});
