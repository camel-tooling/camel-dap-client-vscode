# Advanced Configurations

## Use a Debug Launch configuration

### Start a Camel 3.16+ application with `camel-debug` on the classpath

1. In `.vscode/launch.json`, provide this kind of content for a local default JMX connection (which is `service:jmx:rmi:///jndi/rmi://localhost:1099/jmxrmi/camel`):
2. In the `Run and Debug` panel, launch the `Attach Camel Debugger`
3. Put a breakpoint on the Camel route
4. Enjoy!

```json
{   
    "version": "0.2.0",
    "configurations": [
        {
            "type": "apache.camel",
            "request": "attach",
            "name": "Attach Camel Debugger"
        }
    ]
}
```

## Configuration possibilities of the Debug Launch configuration

In the `.vscode/launch.json`, provide this kind of content for a local default JMX connection (which is `service:jmx:rmi:///jndi/rmi://localhost:1099/jmxrmi/camel`):

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "apache.camel",
            "request": "attach",
            "name": "Attach Camel Debugger"
        }
    ]
}
```

or for a specific JMX Url

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "apache.camel",
            "request": "attach",
            "name": "Attach Camel Debugger",
            "attach_jmx_url": "service:jmx:rmi:///jndi/rmi://localhost:1099/jmxrmi/camel"
        }
    ]
}
  ```

or for a local connection using PID of the Camel application process:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "apache.camel",
            "request": "attach",
            "name": "Attach Camel Debugger",
            "attach_pid": "857136"
        }
    ]
}
```
