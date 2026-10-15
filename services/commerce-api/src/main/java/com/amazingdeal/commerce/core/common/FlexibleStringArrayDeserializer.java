package com.amazingdeal.commerce.core.common;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class FlexibleStringArrayDeserializer extends JsonDeserializer<String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        if (node == null || node.isNull()) {
            return "[]";
        }

        if (node.isArray()) {
            List<String> list = new ArrayList<>();
            for (JsonNode item : node) {
                if (item != null && !item.isNull()) {
                    list.add(item.asText());
                }
            }
            return MAPPER.writeValueAsString(list);
        } else if (node.isTextual()) {
            String text = node.asText().trim();
            if (text.startsWith("[") && text.endsWith("]")) {
                return text;
            } else if (text.isBlank()) {
                return "[]";
            } else {
                return MAPPER.writeValueAsString(List.of(text));
            }
        }
        return "[]";
    }
}
