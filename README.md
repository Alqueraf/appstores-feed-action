# Appstore and Playstore feed action  

Add a list of your live mobile apps from the appstore and playstore to your README page with automated content refresh!

[Check it on the Readme Profile!](https://github.com/Alqueraf/Alqueraf#-latest-projects)

## How to use

- Go to your repository.
- Add the following section to your **README.md** file, you can give whatever title you want. Just make sure that you use `<!-- APPSTORES-FEED:START --><!-- APPSTORES-FEED:END -->` in your readme. The workflow will replace this comment with the actual app data:

```markdown
# My Apps
<!-- APPSTORES-FEED:START -->
<!-- APPSTORES-FEED:END -->
```

- Create a folder named `.github` and create a `workflows` folder inside it if it doesn't exist.
- Create a new file named `appstores-feed-workflow.yml` with the following contents inside the workflows folder:

```yaml
name: Latest appstores data workflow
on:
  schedule: # Run workflow automatically
    - cron: '0 * * * *' # Runs every hour, on the hour
  workflow_dispatch: # Run workflow manually (without waiting for the cron to be called), through the Github Actions Workflow page directly
jobs:
  update-readme-with-apps:
    name: Update this repo's README with latest appstores data
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: alqueraf/appstores-feed-action@master
        with:
          app_ids: "123321, org.example1, 321123, org.example2"
```

- Replace the above app_ids with your actual apps from the playstore or and the appstore.
  > Do not add the `id` prefix for appstore apps.
- Commit and wait for it to run automatically or you can also trigger it manually from the Actions tab to see the result instantly.

### Options

This workflow has additional options that you can use to customize it for your use case. The following are the list of options available:

| Option | Default Value | Description | Required |
|--------|--------|--------|--------|
| `app_ids` | `""` | Comma-separated list of appstore app ids from the appstore (without the id prefix) and/or package ids from the playstore. Example: `123321,org.example1,321123,org.example2` | Yes  |
| `readme_path` | `./README.md` | Path of the readme file you want to update | No  |
| `image_folder_path` | `./app` | Path of the folder to store an svg image for each app | No |
| `gh_token` | Your GitHub token with repo scope | Use this to configure the token of the user that commits the workflow result to GitHub | No |
| `commit_message` | `Updated with the latest apps data` | Allows you to customize the commit message | No |
| `committer_username` | `appstores-feed-bot` | Allows you to customize the committer username | No |
| `committer_email` | `appstores-feed-bot@example.com` | Allows you to customize the committer email | No |

## Contributing

Feel free to open an issue to discuss or send a PR directly with the improvements.

## Bugs

If you are experiencing any bugs, don’t forget to open a [new issue](https://github.com/alqueraf/appstores-feed-action/issues/new).

## Liked it?

Hope you liked this project, don't forget to give it a star ⭐

## Local Development

- To test the appstores service, uncomment the line `appstoresService.getLatestAppsData` inside the [AppstoresService](services/appstores.service.js) file and set your coma-separtated list of app ids. - Use `node services/appstores.service.js` to run the script.

## Deployment

- Run `ncc build appstores-feed-action.js --license licenses.txt` to compile your changes.
- Commit and push the updated code.
