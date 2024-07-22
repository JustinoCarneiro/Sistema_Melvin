package br.com.melvin.sistema.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "file")
public class FileStorageProperties {

    private String uploadDirDiarios;
    private String uploadDirImagensembaixadores;
    private String uploadDirImagensavisos;

    public String getUploadDirDiarios() {
        return uploadDirDiarios;
    }
    public void setUploadDirDiarios(String uploadDirDiarios) {
        this.uploadDirDiarios = uploadDirDiarios;
    }
    public String getUploadDirImagensavisos() {
        return uploadDirImagensavisos;
    }
    public void setUploadDirImagensavisos(String uploadDirImagensavisos) {
        this.uploadDirImagensavisos = uploadDirImagensavisos;
    }
    public String getUploadDirImagensembaixadores() {
        return uploadDirImagensembaixadores;
    }
    public void setUploadDirImagensembaixadores(String uploadDirImagensembaixadores) {
        this.uploadDirImagensembaixadores = uploadDirImagensembaixadores;
    }

}
