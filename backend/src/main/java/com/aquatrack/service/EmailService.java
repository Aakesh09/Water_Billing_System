package com.aquatrack.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendInvitationEmail(String toEmail, String residentName, String code, String link) {
        try {
            if (mailSender == null) {
                System.out.println("[EMAIL SIMULATOR] Sent invitation code " + code + " to " + toEmail);
                return;
            }
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(toEmail);
            msg.setSubject("AquaTrack Resident Portal Registration Invitation");
            msg.setText("Hello " + residentName + ",\n\n" +
                    "Your building owner has registered you on AquaTrack.\n" +
                    "Your Invitation Code is: " + code + "\n\n" +
                    "Click here to complete registration: " + link + "\n\n" +
                    "AquaTrack Team");
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("Could not dispatch email via SMTP (logged instead): " + e.getMessage());
        }
    }

    public void sendBillNotification(String toEmail, String residentName, String invoiceNo, Double amount) {
        try {
            if (mailSender == null) {
                System.out.println("[EMAIL SIMULATOR] Bill alert for " + invoiceNo + " sent to " + toEmail);
                return;
            }
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(toEmail);
            msg.setSubject("New Water Bill Generated - " + invoiceNo);
            msg.setText("Hello " + residentName + ",\n\n" +
                    "Your latest monthly water bill has been generated.\n" +
                    "Invoice: " + invoiceNo + "\n" +
                    "Total Amount: Rs " + amount + "\n\n" +
                    "Log into AquaTrack to view your tiered consumption breakdown.\n\n" +
                    "AquaTrack Team");
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("Failed to send bill email: " + e.getMessage());
        }
    }
}