function checkWarnings(project, state) {
    state.warnings = validateUrls(project, state.warnings);

    project.tabs.forEach(tab => {
        tab.rules.forEach(rule => {
            state.warnings[tab.id] = validateHttpMethod(rule.request.method, rule.id, state.warnings[tab.id]);

            rule.request.urlVariables.forEach((variable, index) => {
                state.warnings[tab.id] = validateUrlVariableKey(variable.key, rule.id, index, state.warnings[tab.id]);
                state.warnings[tab.id] = validateUrlVariableValue(variable.value, rule.id, index, state.warnings[tab.id]);
            });

            rule.request.parameters.forEach((parameter, index) => {
                state.warnings[tab.id] = validateParameterKey(parameter.key, rule.id, index, state.warnings[tab.id]);

                if (!parameter.condition.includes('PRESENT')) {
                    state.warnings[tab.id] = validateParameterValue(parameter.key, rule.id, index, state.warnings[tab.id]);
                }
            });

            rule.request.headers.forEach((header, index) => {
                state.warnings[tab.id] = validateHeaderKey(header.key, rule.id, 'request', index, state.warnings[tab.id]);

                if (!header.condition.includes('PRESENT')) {
                    state.warnings[tab.id] = validateHeaderValue(header.value, rule.id, 'request', index, state.warnings[tab.id]);
                }
            });

            if (!rule.request.bodyCondition.includes('PRESENT')) {
                state.warnings[tab.id] = validateBody(rule.request.body, rule.id, state.warnings[tab.id]);
            }

            state.warnings[tab.id] = validateStatusCode(rule.response.statusCode, rule.id, state.warnings[tab.id]);

            if (rule.response.delayResponse) {
                state.warnings[tab.id] = validateDelay(rule.response.delay, rule.id, state.warnings[tab.id]);
            }

            rule.response.headers.forEach((header, index) => {
                state.warnings[tab.id] = validateHeaderKey(header.key, rule.id, 'response', index, state.warnings[tab.id]);
                state.warnings[tab.id] = validateHeaderValue(header.value, rule.id, 'response', index, state.warnings[tab.id]);
            });

            if (!state.warnings[tab.id]) {
                delete state.warnings[tab.id];
            }
        });
    });

    return state;
}

function copyWarnings(prefix, ruleId, warnings) {
    Object.entries(warnings)
          .filter(([id]) => id.startsWith(prefix))
          .forEach(([id, warning]) => {
              warnings[id.replace(prefix, ruleId)] = warning;
          });
}

function deleteWarnings(prefix, warnings) {
    Object.keys(warnings)
          .filter(id => id.startsWith(prefix))
          .forEach(id => {
              delete warnings[id];
          });
}

function deleteEmptyWarnings(warnings) {
    Object.entries(warnings)
          .filter(([_, tabWarnings]) => !tabWarnings || !Object.keys(tabWarnings).length)
          .map(([tabId, _]) => tabId)
          .forEach(id => {
              delete warnings[id];
          });
}

function shiftIndexedWarnings(condition, index, warnings) {
    const regex = new RegExp(`${condition}-(\\d+)`);

    let modified = {};

    Object.entries(warnings)
          .forEach(([id, warning]) => {
              const match = regex.exec(id);

              if (match) {
                  const idx = parseInt(match[1]);

                  if (idx > index) {
                      modified = {...modified, [id.replace(regex, `${condition}-${idx - 1}`)]: warning};
                  } else {
                      modified = {...modified, [id]: warning};
                  }
              } else {
                  modified = {...modified, [id]: warning};
              }
          });

    return modified;
}

function validateUrls(project, warnings) {
    const duplicates = {};

    project.tabs.forEach(tab => {
        warnings[tab.id] = validateUrl(tab.url, warnings[tab.id]);

        const temp = tab.url.replace(/{{(.+?)}}/g, '{{-}}');

        duplicates[temp] = duplicates[temp] || [];
        duplicates[temp].push(tab.id);
    });

    for (let url in duplicates) {
        if (duplicates[url].length > 1) {
            duplicates[url].forEach(id => {
                warnings[id] = warnings[id] || {};
                if (!warnings[id]['url']) {
                    warnings[id]['url'] = 'Mock URL must be unique in project scope';
                }
            });
        }
    }

    deleteEmptyWarnings(warnings);

    return warnings;
}

function validateUrl(url, warnings) {
    const field = 'url';

    if (isNotEmpty(url)) {
        if (isValidUrl(url)) {
            if (warnings) {
                delete warnings[field];
            }
        } else {
            warnings = warnings || {};
            warnings[field] = 'Mock URL must be valid';
        }
    } else {
        warnings = warnings || {};
        warnings[field] = 'Mock URL cannot be empty';
    }

    return warnings;
}

function validateHttpMethod(method, ruleId, warnings) {
    const field = `${ruleId}-request-method`;

    if (isNotEmpty(method)) {
        if (isValidHttpMethod(method)) {
            if (warnings) {
                delete warnings[field];
            }
        } else {
            warnings = warnings || {};
            warnings[field] = 'HTTP method must be valid';
        }
    } else {
        warnings = warnings || {};
        warnings[field] = 'HTTP method cannot be empty';
    }

    return warnings;
}

function validateUrlVariableKey(key, ruleId, index, warnings) {
    const field = `${ruleId}-request-variable-${index}-key`;

    if (isNotEmpty(key)) {
        if (isValidUrlVariableKey(key)) {
            if (warnings) {
                delete warnings[field];
            }
        } else {
            warnings = warnings || {};
            warnings[field] = 'URL variable key must be valid';
        }
    } else {
        warnings = warnings || {};
        warnings[field] = 'URL variable key cannot be empty';
    }

    return warnings;
}

function validateUrlVariableValue(value, ruleId, index, warnings) {
    const field = `${ruleId}-request-variable-${index}-value`;

    if (isNotEmpty(value)) {
        if (isValidUrlVariableValue(value)) {
            if (warnings) {
                delete warnings[field];
            }
        } else {
            warnings = warnings || {};
            warnings[field] = 'URL variable value must be valid';
        }
    } else {
        warnings = warnings || {};
        warnings[field] = 'URL variable value cannot be empty';
    }

    return warnings;
}

function validateParameterKey(key, ruleId, index, warnings) {
    const field = `${ruleId}-request-parameter-${index}-key`;

    if (isNotEmpty(key)) {
        if (isValidParameterKey(key)) {
            if (warnings) {
                delete warnings[field];
            }
        } else {
            warnings = warnings || {};
            warnings[field] = 'Parameter key must be valid';
        }
    } else {
        warnings = warnings || {};
        warnings[field] = 'Parameter key cannot be empty';
    }

    return warnings;
}

function validateParameterValue(value, ruleId, index, warnings) {
    const field = `${ruleId}-request-parameter-${index}-value`;

    if (isNotEmpty(value)) {
        if (isValidParameterValue(value)) {
            if (warnings) {
                delete warnings[field];
            }
        } else {
            warnings = warnings || {};
            warnings[field] = 'Parameter value must be valid';
        }
    } else {
        warnings = warnings || {};
        warnings[field] = 'Parameter value cannot be empty';
    }

    return warnings;
}

function validateHeaderKey(key, ruleId, rqrs, index, warnings) {
    const field = `${ruleId}-${rqrs}-header-${index}-key`;

    if (isNotEmpty(key)) {
        if (isValidHeaderKey(key)) {
            if (warnings) {
                delete warnings[field];
            }
        } else {
            warnings = warnings || {};
            warnings[field] = 'Header key must be valid';
        }
    } else {
        warnings = warnings || {};
        warnings[field] = 'Header key cannot be empty';
    }

    return warnings;
}

function validateHeaderValue(value, ruleId, rqrs, index, warnings) {
    const field = `${ruleId}-${rqrs}-header-${index}-value`;

    if (isNotEmpty(value)) {
        if (isValidHeaderValue(value)) {
            if (warnings) {
                delete warnings[field];
            }
        } else {
            warnings = warnings || {};
            warnings[field] = 'Header value must be valid';
        }
    } else {
        warnings = warnings || {};
        warnings[field] = 'Header value cannot be empty';
    }

    return warnings;
}

function validateBody(body, ruleId, warnings) {
    const field = `${ruleId}-request-body`;

    if (isNotEmpty(body)) {
        if (warnings) {
            delete warnings[field];
        }
    } else {
        warnings = warnings || {};
        warnings[field] = 'Body cannot be empty';
    }

    return warnings;
}

function validateStatusCode(statusCode, ruleId, warnings) {
    const field = `${ruleId}-response-statusCode`;

    if (isNotEmpty(statusCode)) {
        if (isValidStatusCode(statusCode)) {
            if (warnings) {
                delete warnings[field];
            }
        } else {
            warnings = warnings || {};
            warnings[field] = 'Status code must be valid';
        }
    } else {
        warnings = warnings || {};
        warnings[field] = 'Status code cannot be empty';
    }

    return warnings;
}

function validateDelay(delay, ruleId, warnings) {
    const field = `${ruleId}-response-delay`;

    if (isNotEmpty(delay)) {
        if (isValidDelay(delay)) {
            if (warnings) {
                delete warnings[field];
            }
        } else {
            warnings = warnings || {};
            warnings[field] = 'Delay must be valid';
        }
    } else {
        warnings = warnings || {};
        warnings[field] = 'Delay cannot be empty';
    }

    return warnings;
}

function isNotEmpty(str) {
   return typeof str === 'number' || (!!str && !!str.length);
}

function containsWhitespace(str) {
    return /\s/.test(str);
}

function isValidUrl(str) {
    if (!containsWhitespace(str) && !/^.*:\/\//.test(str)) {
        try {
            new URL(`http://${str}`);
        } catch (_) {
            return false;
        }

        const match = /([^/?]*)([^?]*)(.*)/.exec(str);

        let result = isValidUrlHostAndUserInfo(match[1]);

        if (match[2]) {
            result = result && isValidUrlPath(match[2]);
        }

        if (match[3]) {
            result = result && isValidUrlQuery(match[3]);
        }

        return result;
    }

    return false;
}

function isValidUrlHostAndUserInfo(str) {
    return !/[{}]/.test(str);
}

function isValidUrlPath(str) {
    if (str) {
        if (str === '/') {
            return false;
        }

        const matches = [...str.matchAll(/{{(.*?)}}/g)].map(match => match[1]);
        const uniqueMatches = new Set(matches);

        if (uniqueMatches.size !== matches.length) {
            return false;
        }

        for (const match of uniqueMatches) {
            if (match.length <= 0 || match.indexOf('/') !== -1) {
                return false;
            }
        }
    }

    return true;
}

function isValidUrlQuery(str) {
    return !str;
}

function isValidHttpMethod(str) {
    return !containsWhitespace(str);
}

function isValidUrlVariableKey(str) {
    return !containsWhitespace(str);
}

function isValidUrlVariableValue(str) {
    return !containsWhitespace(str);
}

function isValidParameterKey(str) {
    return !containsWhitespace(str);
}

function isValidParameterValue(str) {
    return !containsWhitespace(str);
}

function isValidHeaderKey(str) {
    return !containsWhitespace(str);
}

function isValidHeaderValue(str) {
    return true;
}

function isValidStatusCode(str) {
    const statusCode = parseInt(str);

    return statusCode >= 100 && statusCode <= 599;
}

function isValidDelay(str) {
    const delay = parseInt(str);

    return delay >= 0 && delay <= 300000;
}

const validators = {
    url: validateUrls,
    httpMethod: validateHttpMethod,
    urlVariableKey: validateUrlVariableKey,
    urlVariableValue: validateUrlVariableValue,
    parameterKey: validateParameterKey,
    parameterValue: validateParameterValue,
    headerKey: validateHeaderKey,
    headerValue: validateHeaderValue,
    body: validateBody,
    statusCode: validateStatusCode,
    delay: validateDelay
};

function warningsPresent(warnings) {
    return warningsCount(warnings) > 0;
}

function warningsCount(warnings) {
    return Object.entries(warnings).flatMap(([_, tab]) => Object.keys(tab)).length;
}

export {
    checkWarnings,
    copyWarnings,
    deleteWarnings,
    shiftIndexedWarnings,
    validators,
    warningsPresent,
    warningsCount
};
