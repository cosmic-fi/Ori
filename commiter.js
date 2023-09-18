import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: env.process.token});

async function listenToCommits() {
  try {
    const owner = env.process.owner_id;
    const repo = env.process.repo_key;

    await octokit.activity.startWatchingRepoForAuthenticatedUser({
      owner,
      repo,
    });
    
    console.log(`Now listening to commits in ${owner}/${repo} repository.`);
    
    for await (const { data } of octokit.paginate.iterator(
      octokit.activity.listRepoEventsForAuthenticatedUser,
      { owner, repo, per_page: 100 }
    )) {
      const commitEvents = data.filter(
        (event) => event.type === "PushEvent"
      );

      for (const commitEvent of commitEvents) {
        const { sha, ref, commits } = commitEvent.payload;
        
        console.log(`New commits in ${owner}/${repo}:`);
        console.log(`Branch: ${ref}`);
        console.log(`Commits:`);
        commits.forEach((commit) => {
          console.log(`- ${commit.message}`);
        });
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

listenToCommits();
