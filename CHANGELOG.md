# Change Log

All notable changes to the "vscode-debug-adapter-apache-camel" extension will be documented in this file.

## 1.6.0

- Avoid potential activation error when no workspace/folder is opened
- Upgrade embedded Debug Adapter for Apache Camel to 1.6.0

## 1.5.0

- Use containing folder by default with commands and quick editor action when launching a specific Camel Route. It allows to have other relative parameters still working when it is inside a subfolder.
- Skip '*.xsl' argument for all run commands when there is none XSL file found in a workspace
- Upgrade embedded Debug Adapter for Apache Camel to 1.5.0

## 1.4.0

- Update default Camel version used for Camel JBang from 4.7.0 to 4.8.1
- Provide command for a deployment of Camel standalone file using Camel JBang Kubernetes plugin. It is available for Camel JBang version 4.8+.
- Include `*.xsl` files by default when launching with Camel JBang
- Upgrade embedded Debug Adapter for Apache Camel to 1.4.0

## 1.3.0

- Provide command and quick action to run with JBang from parent folder of current opened file
- Grouped run and debug quick editor action in the `Run or debug...` quick editor action
- Upgrade embedded Debug Adapter for Apache Camel to 1.3.0

## 1.2.0

- Support remote debug through http (when using Jolokia on server-side)
- Update default Camel version used for Camel JBang from 4.6.0 to 4.7.0
- Upgrade embedded Debug Adapter for Apache Camel to 1.2.0

## 1.1.0

- Update Red Hat telemetry dependency to reduce number of event sent (startup information will be sent one time per day per user)
- Upgrade embedded Debug Adapter for Apache Camel to 1.1.0

## 1.0.0

- Update default Camel version used for Camel JBang from 4.5.0 to 4.6.0
- Added warning notification when users are trying to run or debug integration without opened folder/workspace
- Upgrade embedded Debug Adapter for Apache Camel to 1.0.0

## 0.13.0

- Update default Camel version used for Camel JBang from 4.4.0 to 4.5.0
- Add support for custom parameters while running or debugging a camel application.
- Upgrade embedded Debug Adapter for Apache Camel to 0.13.0

## 0.12.0

- Update default Camel version used for Camel JBang from 4.3.0 to 4.4.0
- Upgrade Debug Adapter for Apache Camel to 0.12.0

## 0.11.0

- Minimal version of VS Code to run this extension is 1.82.0
- Update default Camel version used for Camel JBang from 4.2.0 to 4.3.0
- Upgrade Debug Adapter for Apache Camel to 0.11.0

## 0.10.0

- Update default Camel version used for Camel JBang from 4.0.0 to 4.2.0
- Provide build and start tasks completion inside `.vscode/tasks.json` for a Camel Quarkus native application
- The support of Exchange Properties in Variables of the debugger for Camel 4.1- has been removed to be able to support Camel 4.2+ in a timely and maintainable manner.
- Upgrade Debug Adapter for Apache Camel to 0.10.0

## 0.9.0

- Java 17+ is the minimal required version to launch the embedded Debug Adapter for Camel.
- On `Step In` and `Step Out` actions, redirect to `Next Step` (as specified by Debug Adapter Protocol specification when no specific implementation is provided)
- Update default Camel version used for Camel JBang from 3.21.0 to 4.0.0
- Provide settings for specifying the Red Hat Maven Repository
  - the repository is automatically used when the Camel version contains `redhat`
- Upgrade Debug Adapter for Apache Camel to 0.9.0

## 0.8.0

- Provide settings for specifying the Camel version to run integrations with Camel JBang CLI
- Update default Camel version used for Camel JBang from 3.20.5 to 3.21.0
- Upgrade Debug Adapter for Apache Camel to 0.8.0

## 0.7.0

- Minimal version of VS Code to run this extension is 1.76.0
- Provide Codelens to `Camel Run with JBang`
- Provide Contextual Menu on File Explorer to `Run Camel Application with JBang`
- `Camel Run with JBang` command is now using [automatic reloading](https://camel.apache.org/manual/camel-jbang.html#_dev_mode_with_live_reload)
- Provide default Camel JBang version 3.20.5 for commands `Camel Run with JBang` and `Camel Debug with JBang`
- Provide settings for default Camel JBang version
- Upgrade Debug Adapter for Apache Camel to 0.7.0

## 0.6.0

- Upgrade Debug Adapter for Apache Camel to 0.6.0
- Fix typo in tooltip of codelens `Camel debug with JBang`
- Provide 'Camel' category for command to ease research in command palette
- Rename command 'Start Camel Application with JBang and Debug' to 'Run Camel Application with JBang and Debug'
- Provide command to run Camel file with JBang
- Provide Action to Run and Debug with JBang for Camel files
- Provide Action to Run with Camel JBang for Camel files

## 0.5.0

- Upgrade Debug Adapter for Apache Camel to 0.5.0
- Fix regression on updating variable values [FUSETOOLS2-1819](https://issues.redhat.com/browse/FUSETOOLS2-1819)
- Improve codelens to make it clearer on requirements and purpose [FUSETOOLS2-1814](https://issues.redhat.com/browse/FUSETOOLS2-1814)
- Improve tooltip for breakpoints: removed for verified one, more details when unverified [FUSETOOLS2-1670](https://issues.redhat.com/browse/FUSETOOLS2-1670)

## 0.4.0

- Await configuration of debugger set before processing Camel route (available with Camel Application 3.18+)
- Provide additional VS Code Task templates:
  - Using the `camel:debug` Maven goal (requires Camel Application using 3.18+)
  - To launch a test with Maven
- Upgrade Debug Adapter for Apache Camel to 0.4.0

## 0.3.0

- Upgrade Debug Adapter for Apache Camel to 0.3.0
- Provide Codelens to `Debug with JBang`
- Provide contextual menu on File Explorer to `Start Camel Application with JBang and debug`
- Support setting breakpoints before starting the debugger
- Provide configuration snippet to launch Camel application ready to accept a Camel debugger connection using Quarkus Dev mode
- Support conditional breakpoint with `simple` language

## 0.2.0

- Provide command `Start Camel Application with JBang and debug`. It allows a one-click start and Camel debug in simple cases.
- Provide error message and remind requirements in case of failure when trying to attach the debugger
- Provide configuration snippets for Camel debugger launch configuration
- Provide configuration snippets to launch Camel application ready to accept a Camel debugger connection using JBang or Maven with Camel maven plugin
- Upgrade Debug Adapter for Apache Camel to 0.2.0

## 0.1.1

- Fix Launch Configuration data type: removing `attach_pid` as mandatory and provide `attach_jmx_url`

## 0.1.0

- Allow to update values of variables:
  - in scope `Debugger`
  - the message body
  - a message header when it is of type String
  - an exchange property when it is of type String
- Support JMX connection

## 0.0.2

- Support Camel routes written with Camel Yaml DSL
- Support Camel routes written with Camel XML DSL in `Camel Main` mode with `route` or `routes` top-level tag
- Add keywords to the extension to have a better discoverability in the Marketplace
- Provide icon for the extension to improve visibility in marketplace. It also improve coherence with other `Camel Tooling` extensions
- Provide license file at the root of the binary to better match `vsce` recommendations
- Provide telemetry (opt-in) for success/failure of Camel debug session start

## 0.0.1

- Support local use of Camel debugger by attaching to a running Camel route written in Java using the PID
- Support a single Camel context
- Add/Remove breakpoint
- Inspect variable values on suspended breakpoints
- Resume a single route instance and resume all route instances
- Stepping when the route definition is in the same file
- The Camel instance to debug must follow these requirements:
  - Camel 3.15+
  - Have camel-debug on the classpath
  - Have JMX enabled
- The Camel Debug Server Adapter must use Java Runtime Environment 11+ with com.sun.tools.attach.VirtualMachine (available in most JVMs such as Hotspot and OpenJDK).
