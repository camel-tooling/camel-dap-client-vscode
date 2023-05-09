# Change Log

All notable changes to the "vscode-debug-adapter-apache-camel" extension will be documented in this file.

## 0.7.0

- Provide Codelens to `Camel Run with JBang`
- Provide Contextual Menu on File Explorer to `Run Camel Application with JBang`
- `Camel Run with JBang` command is now using [automatic reloading](https://camel.apache.org/manual/camel-jbang.html#_dev_mode_with_live_reload)

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
