# How to start development

- call "npm install"
- right-click on the package.json and call "install dependencies"
- go to "Debug perspective" (Ctrl+Shift+D)
- select "Run extension"
- click on the green arrow

When testing new version of the Camel Debug Adapter Server, just replace the jar in "jars" folder respecting the name "camel-dap-server.jar"

# How to provide a new version on VS Code Marketplace and OpenVSX Marketplace

* Check that the version in package.json has not been published yet
** If already published:
*** Run 'npm version --no-git-tag-version patch' so that the version is updated
*** Push changes in a PR
*** Wait for PR to be merged
* Point to a release version of Debug Adapter Server. During development it can point to snapshots but for release it must be a released version. See [this doc](https://github.com/camel-tooling/camel-debug-adapter/blob/main/Contributing.md#how-to-release) to release the server.
* Check that someone listed as _submitter_ in Jenkinsfile is available
* Check build is working fine on [GitHub Actions](https://github.com/camel-tooling/camel-dap-client-vscode/actions) and [Jenkins CI](https://studio-jenkins-csb-codeready.apps.ocp-c1.prod.psi.redhat.com/job/Fuse/job/VSCode/job/vscode-camel-dap-release/)
* Start build on [Jenkins CI](https://studio-jenkins-csb-codeready.apps.ocp-c1.prod.psi.redhat.com/job/Fuse/job/VSCode/job/vscode-camel-dap-release/) with _publishToMarketPlace_ and _publishToOVSX_ parameters checked
* Wait the build is waiting on step _Publish to Marketplace_
* For someone from _submitter_ list:
** Ensure you are logged in
** Go to the console log of the build and click "Proceed"
* Wait few minutes and check that it has been published on [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-debug-adapter-apache-camel) and [Open VSX Marketplace](https://open-vsx.org/extension/redhat/vscode-debug-adapter-apache-camel)
* Keep build forever for later reference and edit build information to indicate the version
* Create a tag and push it
* Prepare next iteration:
** Run 'npm version --no-git-tag-version patch' to update the version
** Push changes in a PR
** Follow PR until it is approved/merged
