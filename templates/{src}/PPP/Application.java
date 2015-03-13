package <%= gen.package %>;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication
<% if(has(all.config.tags.build.dependencies, 'artifactId', 'spring-cloud-starter-eureka-server')) { %>
@EnableEurekaClient
<% } %>
@EnableHystrix
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
