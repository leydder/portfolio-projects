package com.legp.constructora.service;

import org.springframework.stereotype.Service;
import com.legp.constructora.repository.AttachmentRepository;
import com.legp.constructora.model.Attachment;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttachmentService {
    private final AttachmentRepository attachmentRepository;

    public AttachmentService(AttachmentRepository attachmentRepository) {
        this.attachmentRepository = attachmentRepository;
    }

    public Attachment createAttachment(Attachment attachment) {
        attachment.setUploadedAt(LocalDateTime.now());
        return attachmentRepository.save(attachment);
    }

    public List<Attachment> getAllAttachments() {
        return attachmentRepository.findAll();
    }

    public Optional<Attachment> getAttachmentById(Long id) {
        return attachmentRepository.findById(id);
    }

    public Optional<Attachment> updateAttachment(Long id, Attachment attachmentDetails) {
        return attachmentRepository.findById(id).map(attachment -> {
            attachment.setProject(attachmentDetails.getProject());
            attachment.setFileName(attachmentDetails.getFileName());
            attachment.setFileType(attachmentDetails.getFileType());
            attachment.setFilePath(attachmentDetails.getFilePath());
            return attachmentRepository.save(attachment);
        });
    }

    public boolean deleteAttachment(Long id) {
        if (!attachmentRepository.existsById(id)) {
            return false;
        }
        attachmentRepository.deleteById(id);
        return true;
    }

}
