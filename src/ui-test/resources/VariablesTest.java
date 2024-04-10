import org.apache.camel.builder.RouteBuilder;

public class VariablesTest extends RouteBuilder {
    @Override
    public void configure() throws Exception {
        from("timer:foo")
            .setVariable("item", constant("world"))
            .setVariable("name", constant("Camel"))
            .log("Hello ${variable.item} and ${variable.name}");
    }
}
