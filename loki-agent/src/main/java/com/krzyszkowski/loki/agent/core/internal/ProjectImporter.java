package com.krzyszkowski.loki.agent.core.internal;

import com.krzyszkowski.loki.agent.io.ProjectParserResolver;
import com.krzyszkowski.loki.api.project.Project;
import org.springframework.stereotype.Component;

@Component
public class ProjectImporter {

    private final ProjectParserResolver resolver;

    public ProjectImporter(ProjectParserResolver resolver) {
        this.resolver = resolver;
    }

    public Project importProject(byte[] project) {
        return resolver.parseInput(project);
    }
}
