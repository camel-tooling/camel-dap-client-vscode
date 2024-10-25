# Deployment into cluster using Camel JBang Kubernetes plugin

## Manage deployment lifecycle

There are extensions which allows you to manage your deployments (which are part of an [Extension Pack for Apache Camel](https://marketplace.visualstudio.com/items?itemName=redhat.apache-camel-extension-pack)):

- [OpenShift Toolkit](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-openshift-connector)
- [Kubernetes](https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools)

or you can use a power of Camel CLI described below.

### Follow logs

You can use Camel CLI to obtain logs of current running integration. In terminal window execute:

```shell
jbang camel@apache/camel kubernetes logs --name=<name>
```

### Remove deployment

To remove current integration, you can use also Camel CLI. In this case the command is:

```shell
jbang camel@apache/camel kubernetes delete --name=<name>
```

#### Troubleshooting

For a latest releases of Camel (4.8.1+) there could be problem when deleting deployments using Camel Jbang CLI, for details you can see reported upstream issue [CAMEL-21388](https://issues.apache.org/jira/browse/CAMEL-21388).

In that case please try with previous version which was working better.

```shell
jbang -Dcamel.jbang.version=4.8.0 camel@apache/camel kubernetes delete --name=<name>
```

## How to deploy into local Kubernetes cluster

By default, the deployment aims OpenShift cluster. In case you need to deploy into Kubernetes, there is a small modification needed:

1) open Settings UI in VS Code
    - Linux/Windows - `File > Preferences > Settings`
    - macOS - `Code > Settings... > Settings`
2) navigate to `Extensions > Debug Adapter for Apache Camel`
3) modify setting `Camel > Debug Adapter: Kubernetes Run Parameters` as you can see on picture below

![Deploy to Kubernetes cluster with Minikube](../images/kubernetes-run-params.png)

The picture describes how to deploy to local Kubernetes cluster using Minikube. You can use eg. also `Kind`. In that case, just change to `--cluster-type=kind`.

For more information see [Camel Kubernetes plugin official documentation](https://camel.apache.org/manual/camel-jbang-kubernetes.html).
