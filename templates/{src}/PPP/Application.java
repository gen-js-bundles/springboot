package <%= gen.package %>;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
<% if(has(all.config.tags.build.dependencies, 'artifactId', 'spring-cloud-starter-eureka-server')) { %>
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
<% } %>
<% if(has(all.config.tags.build.dependencies, 'artifactId', 'spring-cloud-starter-hystrix')) { %>
import org.springframework.cloud.netflix.hystrix.EnableHystrix;
<% } %>

@SpringBootApplication
<% if(has(all.config.tags.build.dependencies, 'artifactId', 'spring-cloud-starter-eureka-server')) { %>
@EnableEurekaClient
<% } %>
<% if(has(all.config.tags.build.dependencies, 'artifactId', 'spring-cloud-starter-hystrix')) { %>
@EnableHystrix
<% } %>
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
