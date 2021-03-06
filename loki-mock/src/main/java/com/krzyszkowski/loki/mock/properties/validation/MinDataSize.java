package com.krzyszkowski.loki.mock.properties.validation;

import org.springframework.util.unit.DataUnit;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = MinDataSizeValidator.class)
public @interface MinDataSize {

    String message() default "Must be greater than or equal to {value} {unit}";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    long value();

    DataUnit unit();
}
