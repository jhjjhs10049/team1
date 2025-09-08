package org.zerock.mallapi.global.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.modelmapper.config.Configuration.AccessLevel;

@Configuration
public class RootConfig {
    //Spring에서 ModelMapper를 전역 빈으로 등록해, 
    //DTO와 엔티티 간의 필드 매핑을 느슨하게(LOOSE) 하고, 
    //private 필드까지 접근할 수 있게 설정한 JavaConfig
    @Bean
    public ModelMapper getMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setFieldMatchingEnabled(true)
                .setFieldAccessLevel(AccessLevel.PRIVATE)
                .setMatchingStrategy(MatchingStrategies.LOOSE);

        return modelMapper;
    }
}
