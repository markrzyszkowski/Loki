package com.krzyszkowski.loki.mock.core.services;

import com.krzyszkowski.loki.api.mock.Header;
import com.krzyszkowski.loki.api.mock.Response;
import com.krzyszkowski.loki.mock.core.internal.RuleMatcher;
import com.krzyszkowski.loki.mock.core.internal.MockRepository;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

@Service
@Profile("static")
public class StaticMockService implements MockService {

    private final MockRepository mockRepository;
    private final ObjectFactory<RuleMatcher> ruleMatcherFactory;

    public StaticMockService(MockRepository mockRepository, ObjectFactory<RuleMatcher> ruleMatcherFactory) {
        this.mockRepository = mockRepository;
        this.ruleMatcherFactory = ruleMatcherFactory;
    }

    @Override
    public ResponseEntity<byte[]> handle(HttpServletRequest request, HttpServletResponse response) {
        var mock = mockRepository.findMock(request.getRequestURI().substring(1)).orElseThrow();

        var rule = ruleMatcherFactory.getObject()
                                     .searchIn(mock.getRules())
                                     .forRuleMatching(request);
        if (rule.isPresent()) {
            var ruleResponse = rule.get().getResponse();

            populateResponse(response, ruleResponse);

            return ResponseEntity
                    .status(ruleResponse.getStatus())
                    .body(ruleResponse.getBody().getContent().getBytes());
        }

        return ResponseEntity
                .status(HttpStatus.I_AM_A_TEAPOT)
                .build();
    }

    private void populateResponse(HttpServletResponse response, Response ruleResponse) {
        populateHeaders(response, ruleResponse.getHeaders());
    }

    private void populateHeaders(HttpServletResponse response, List<Header> headers) {
        headers.forEach(header -> response.setHeader(header.getName(), header.getValue()));
    }
}
