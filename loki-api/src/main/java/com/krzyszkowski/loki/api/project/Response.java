package com.krzyszkowski.loki.api.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Response {

    private int statusCode;
    private List<Header> headers;
    private String body;
    private int delay;
    private boolean delayResponse;
    private boolean expanded;
    private boolean headersExpanded;
}
