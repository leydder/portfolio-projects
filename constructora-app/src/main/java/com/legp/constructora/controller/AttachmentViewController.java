package com.legp.constructora.controller;

import com.legp.constructora.model.Attachment;
import com.legp.constructora.service.AttachmentService;
import com.legp.constructora.service.ProjectService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/attachments")
public class AttachmentViewController {

    private final AttachmentService attachmentService;
    private final ProjectService projectService;

    public AttachmentViewController(AttachmentService attachmentService, ProjectService projectService) {
        this.attachmentService = attachmentService;
        this.projectService = projectService;
    }

    @GetMapping
    public String listAttachments(Model model) {
        model.addAttribute("attachments", attachmentService.getAllAttachments());
        model.addAttribute("attachment", new Attachment());
        model.addAttribute("projects", projectService.getAllProjects());
        return "attachments";
    }

    @PostMapping
    public String createAttachment(@ModelAttribute Attachment attachment) {
        attachmentService.createAttachment(attachment);
        return "redirect:/attachments";
    }
}
