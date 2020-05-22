package com.krzyszkowski.loki.agent.core.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.krzyszkowski.loki.agent.core.internal.ProjectExporter;
import com.krzyszkowski.loki.agent.core.internal.ProjectImporter;
import com.krzyszkowski.loki.api.project.Project;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Optional;

@Slf4j
@Service
public class DefaultProjectService implements ProjectService {

    private final StorageService storageService;
    private final ProjectImporter projectImporter;
    private final ProjectExporter projectExporter;
    private final ObjectMapper objectMapper;

    public DefaultProjectService(StorageService storageService,
                                 ProjectImporter projectImporter,
                                 ProjectExporter projectExporter) {
        this.storageService = storageService;
        this.projectImporter = projectImporter;
        this.projectExporter = projectExporter;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public Optional<Project> openProject(String path) {
        try {
            var projectBytes = storageService.readFile(path);

            return Optional.of(deserializeProject(projectBytes));
        } catch (IOException e) {
            log.error("Error occured while trying to open project");
            log.error("Exception: {}", e.toString());

            return Optional.empty();
        }
    }

    @Override
    public Optional<Project> importProject(String path) {
        try {
            var projectBytes = storageService.readFile(path);

            return Optional.of(projectImporter.importProject(projectBytes));
        } catch (IOException e) {
            log.error("Error occured while trying to import project");
            log.error("Exception: {}", e.toString());

            return Optional.empty();
        }
    }

    @Override
    public boolean exportProject(String path, Project project) {
        try {
            var projectBytes = projectExporter.exportProject(path, project);

            storageService.writeFile(path, projectBytes);

            return true;
        } catch (IOException e) {
            log.error("Error occured while trying to save project");
            log.error("Exception: {}", e.toString());

            return false;
        }
    }

    @Override
    public boolean saveProject(String path, Project project) {
        try {
            var projectBytes = serializeProject(project);

            storageService.writeFile(path, projectBytes);

            return true;
        } catch (IOException e) {
            log.error("Error occured while trying to save project");
            log.error("Exception: {}", e.toString());

            return false;
        }
    }

    private Project deserializeProject(byte[] projectBytes) throws IOException {
        return objectMapper.readValue(projectBytes, Project.class);
    }

    private byte[] serializeProject(Project project) throws IOException {
        return objectMapper.writeValueAsBytes(project);
    }
}
