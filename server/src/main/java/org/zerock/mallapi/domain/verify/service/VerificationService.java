package org.zerock.mallapi.domain.verify.service;

public interface VerificationService {

    public void sendCode(String email);

    public boolean verifyCode(String email, String code);

    public boolean isVerified(String email);

}


