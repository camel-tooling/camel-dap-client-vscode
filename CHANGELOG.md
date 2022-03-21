# Change Log

All notable changes to the "vscode-debug-adapter-apache-camel" extension will be documented in this file.

## 0.1.0

- Allow to update values of variables in scope `Debugger`

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
