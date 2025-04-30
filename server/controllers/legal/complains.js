import Complaint from "../../model/Complains.js";
import EmployeeComplaint from "../../model/employeeComplaint.js";
import axios from "axios";
import nodemailer from "nodemailer";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { sendResolutionNotification } from "../../services/emailService.js";
const assessComplaintComplexity = async (complaintText, complaintType) => {
    // Criteria for complex complaints that require AI intervention
    const complexKeywords = [
        "lawsuit", "legal", "discrimination", "harassment", "violence", 
        "hostile", "union", "compensation", "termination", "whistleblower", 
        "retaliation", "safety violation", "fraud", "wage theft", "overtime",
        "racial", "gender", "disability", "sexual", "ethics", "compliance",
        "misconduct", "confidential", "breach", "investigation"
    ];
    
    // More weight to certain complaint types
    const complexTypes = [
        "Workplace Harassment", 
        "Management Issues"
    ];
    
    // Check if there are complex keywords in the complaint text
    const hasComplexKeywords = complexKeywords.some(keyword => 
        complaintText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check if the complaint type is considered complex
    const isComplexType = complaintType && complexTypes.includes(complaintType);
    
    // Check for length - longer complaints often indicate complexity
    const isLengthyComplaint = complaintText.length > 200;
    
    // Determine if the complaint is complex enough to bypass HR
    return hasComplexKeywords || isComplexType || isLengthyComplaint;
};


// Create complaint
export const createComplaint = async (req, res) => {
    try {
        const { userId, complaintText } = req.body;
        
        // Assess the complexity of the complaint
        const isComplex = await assessComplaintComplexity(complaintText);
        
        const complaint = new Complaint({ 
            userId, 
            complaintText,
            requiresAI: isComplex,
            status: isComplex ? 'Needs AI Review' : 'HR Review'
        });
        
        await complaint.save();
        res.status(201).json(complaint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//employeesComplaints
export const createEmployeeComplaint = async (req, res) => {
    try {
        // Log the incoming request body for debugging
        console.log('Incoming complaint data:', JSON.stringify(req.body, null, 2));
        
        const { 
            employeeId, 
            employeeName, 
            employeeUsername,
            employeeEmail,
            department, 
            complaintType, 
            complaintText,
            urgency,
            isAnonymous 
        } = req.body;
        
        // Validate required fields with more detailed logging
        if (!employeeId) console.log('Missing employeeId');
        if (!employeeName) console.log('Missing employeeName');
        if (!employeeUsername) console.log('Missing employeeUsername');
        if (!employeeEmail) console.log('Missing employeeEmail');
        if (!department) console.log('Missing department');
        if (!complaintType) console.log('Missing complaintType');
        if (!complaintText) console.log('Missing complaintText');
        
        if (!employeeId || !employeeName || !employeeUsername || !employeeEmail || !department || !complaintType || !complaintText) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                details: 'All fields marked with * are required.',
                receivedData: {
                    employeeId: !!employeeId,
                    employeeName: !!employeeName,
                    employeeUsername: !!employeeUsername,
                    employeeEmail: !!employeeEmail,
                    department: !!department,
                    complaintType: !!complaintType,
                    complaintText: !!complaintText
                }
            });
        }
        
        // Assess if the complaint is complex and needs AI resolution
        const isComplex = await assessComplaintComplexity(complaintText, complaintType);
        
        // Create complaint document with all required fields explicitly defined
        const complaint = new EmployeeComplaint({ 
            employeeId, 
            employeeName,
            employeeUsername,
            employeeEmail, 
            department, 
            complaintType, 
            complaintText,
            urgency: urgency || 'Medium',
            isAnonymous: isAnonymous || false,
            requiresAI: isComplex,
            status: isComplex ? 'Needs AI Review' : 'HR Review'
        });
        
        // Log the document before saving for debugging
        console.log('Saving complaint document:', JSON.stringify(complaint, null, 2));
        
        await complaint.save();
        
        res.status(201).json({
            success: true,
            complaint,
            message: isComplex ? 
                'Complex complaint submitted successfully. Will be handled by specialized AI system.' : 
                'Complaint submitted successfully. Will be handled by HR.'
        });
    } catch (error) {
        console.error('Error in createEmployeeComplaint:', error);
        res.status(400).json({ 
            success: false,
            message: error.message || 'Failed to create employee complaint',
            receivedData: req.body  // Include received data for debugging
        });
    }
};
//external
export const createEmployeeExternalComplaint = async (req, res) => {
    try {
        // Log the incoming request body for debugging
        console.log('Incoming complaint data:', JSON.stringify(req.body, null, 2));
        
        const {
            employeeId, 
            employeeName, 
            employeeUsername,
            employeeEmail,
            department, 
            complaintType, 
            complaintText,
            urgency,
            isAnonymous 
          } = req.body;
          
          // Only validate strictly required fields
          if (!employeeName) console.log('Missing employeeName');
          if (!employeeEmail) console.log('Missing employeeEmail');
          if (!department) console.log('Missing department');
          if (!complaintType) console.log('Missing complaintType');
          if (!complaintText) console.log('Missing complaintText');
          
          if (!employeeName || !employeeEmail || !department || !complaintType || !complaintText) {
            return res.status(400).json({ 
              message: 'Missing required fields',
              details: 'All fields marked with * are required.',
              receivedData: {
                employeeId: !!employeeId,
                employeeName: !!employeeName,
                employeeUsername: !!employeeUsername,
                employeeEmail: !!employeeEmail,
                department: !!department,
                complaintType: !!complaintType,
                complaintText: !!complaintText
              }
            });
          }
        
        // Assess if the complaint is complex and needs AI resolution
        const isComplex = await assessComplaintComplexity(complaintText, complaintType);
        
        // Create complaint document with all required fields explicitly defined
        const complaint = new EmployeeComplaint({ 
            employeeId, 
            employeeName,
            employeeUsername,
            employeeEmail, 
            department, 
            complaintType, 
            complaintText,
            urgency: urgency || 'Medium',
            isAnonymous: isAnonymous || false,
            requiresAI: isComplex,
            status: isComplex ? 'Needs AI Review' : 'HR Review'
        });
        
        // Log the document before saving for debugging
        console.log('Saving complaint document:', JSON.stringify(complaint, null, 2));
        
        await complaint.save();
        
        res.status(201).json({
            success: true,
            complaint,
            message: isComplex ? 
                'Complex complaint submitted successfully. Will be handled by specialized AI system.' : 
                'Complaint submitted successfully. Will be handled by HR.'
        });
    } catch (error) {
        console.error('Error in createEmployeeComplaint:', error);
        res.status(400).json({ 
            success: false,
            message: error.message || 'Failed to create employee complaint',
            receivedData: req.body  // Include received data for debugging
        });
    }
};

// Get all complaints
export const getComplaints = async (req, res) => {
    try {
        // Fetch all complaints without requiresAI filter
        const complaints = await Complaint.find({}).sort({ createdAt: -1 });
        const employeeComplaints = await EmployeeComplaint.find({}).sort({ createdAt: -1 });

        // Add source label to each item - using toObject() with proper options
        const labeledComplaints = complaints.map(c => ({
            ...c.toObject({ getters: true, virtuals: true }),
            source: 'General Complaint'
        }));

        const labeledEmployeeComplaints = employeeComplaints.map(ec => ({
            ...ec.toObject({ getters: true, virtuals: true }),
            source: 'Employee Complaint'
        }));

        // Combine and sort by creation date (newest first)
        const complexComplaints = [...labeledComplaints, ...labeledEmployeeComplaints]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ complaints: complexComplaints });
    } catch (error) {
        console.error('Error in getComplaints:', error);
        res.status(500).json({ message: 'Error fetching complaints', error: error.message });
    }
};

// Resolve complaint


// Update this section in the resolveComplaintWithAI function
export const resolveComplaintWithAI = async (req, res) => {
    try {
        const { complaintId, complaintText } = req.body;
        
        if (!complaintId) {
            return res.status(400).json({ message: 'Complaint ID is required' });
        }
        
        // Find the complaint in either collection
        let complaint = await Complaint.findById(complaintId);
        let isEmployeeComplaint = false;
        
        if (!complaint) {
            complaint = await EmployeeComplaint.findById(complaintId);
            isEmployeeComplaint = true;
            
            if (!complaint) {
                return res.status(404).json({ message: 'Complaint not found' });
            }
        }
        
        // Set to 'Under Review' instead of 'Processing' - this matches the enum
        complaint.status = 'Under Review';
        await complaint.save();
        
        // In a real application, you might send the complaint to an AI service here
        // For this example, we'll just create a simulated resolution
        const resolutionText = `Your complaint regarding "${complaint.complaintType || 'the issue'}" has been reviewed. 
        Based on our assessment, we have determined the following actions are appropriate: 
        1. Document the incident and add it to our records
        2. Schedule a follow-up meeting with relevant parties
        3. Implement preventative measures to avoid similar issues in the future`;
        
        // Update the complaint with resolution
        complaint.status = 'Resolved';
        complaint.resolutionText = resolutionText;
        
        // Generate resolution document and reference number
        const resolutionRefNumber = `RES-${Date.now().toString().slice(-6)}-${complaint._id.toString().slice(-4)}`;
        complaint.resolutionReference = resolutionRefNumber;
        
        // Generate official action items based on complaint type
        const actionItems = generateActionItems(complaint.complaintType);
        complaint.actionItems = actionItems;
        
        // Set follow-up date (2 weeks from resolution)
        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + 14);
        complaint.followUpDate = followUpDate;
        
        await complaint.save();
        
        // Send email notification to employee if not anonymous
        if (isEmployeeComplaint && complaint.employeeEmail && !complaint.isAnonymous) {
            try {
                await sendResolutionNotification(
                    complaint.employeeEmail, 
                    complaint.employeeName,
                    resolutionRefNumber,
                    resolutionText
                );
                console.log(`Successfully sent email notification to ${complaint.employeeName}`);
            } catch (emailError) {
                console.error('Error sending email notification:', emailError);
                // Continue with the process even if email fails
            }
        }
        
        // Return the updated complaint
        const responseObj = complaint.toObject();
        responseObj.source = isEmployeeComplaint ? 'Employee Complaint' : 'General Complaint';
        
        res.status(200).json(responseObj);
        
    } catch (error) {
        console.error('Error in resolveComplaintWithAI:', error);
        res.status(500).json({ message: 'Error resolving complaint', error: error.message });
    }
};

// Also add a new endpoint to manually send notification emails
export const sendNotification = async (req, res) => {
    try {
        const { complaintId } = req.body;
        
        if (!complaintId) {
            return res.status(400).json({ message: 'Complaint ID is required' });
        }
        
        // Find the complaint in either collection
        let complaint = await Complaint.findById(complaintId);
        let isEmployeeComplaint = false;
        
        if (!complaint) {
            complaint = await EmployeeComplaint.findById(complaintId);
            isEmployeeComplaint = true;
            
            if (!complaint) {
                return res.status(404).json({ message: 'Complaint not found' });
            }
        }
        
        // Check if complaint has been resolved
        if (complaint.status !== 'Resolved' || !complaint.resolutionText) {
            return res.status(400).json({ 
                message: 'Cannot send notification for unresolved complaint' 
            });
        }
        
        // Check if employee complaint and not anonymous
        if (!isEmployeeComplaint || !complaint.employeeEmail || complaint.isAnonymous) {
            return res.status(400).json({ 
                message: 'Cannot send notification for this complaint type or anonymous complaints' 
            });
        }
        
        // Send notification
        try {
            await sendResolutionNotification(
                complaint.employeeEmail,
                complaint.employeeName,
                complaint.resolutionReference || `RES-${complaintId.slice(-6)}`,
                complaint.resolutionText
            );
            
            res.status(200).json({ 
                message: 'Notification sent successfully',
                success: true
            });
        } catch (emailError) {
            console.error('Error in email sending:', emailError);
            res.status(500).json({ 
                message: 'Failed to send email notification', 
                error: emailError.message,
                success: false
            });
        }
        
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ 
            message: 'Error sending notification', 
            error: error.message,
            success: false
        });
    }
};
export const generateResolutionDocument = async (req, res) => {
    try {
        const { complaintId } = req.params;
        
        if (!complaintId) {
            return res.status(400).json({ message: 'Complaint ID is required' });
        }
        
        // Try to find the complaint in either collection
        let complaint = await Complaint.findById(complaintId);
        let isEmployeeComplaint = false;
        
        if (!complaint) {
            complaint = await EmployeeComplaint.findById(complaintId);
            isEmployeeComplaint = true;
            
            if (!complaint) {
                return res.status(404).json({ message: 'Complaint not found' });
            }
        }
        
        // Check if complaint has been resolved
        if (complaint.status !== 'Resolved' || !complaint.resolutionText) {
            return res.status(400).json({ 
                message: 'Cannot generate document for unresolved complaint' 
            });
        }
        
        // Create a PDF document
        const doc = new PDFDocument();
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=resolution-${complaintId}.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);
        
        // Add company logo (you would need to create this file)
        // doc.image('path/to/logo.png', 50, 45, { width: 150 });
        
        // Add document title
        doc.fontSize(20)
           .text('OFFICIAL COMPLAINT RESOLUTION', { align: 'center' })
           .moveDown();
        
        // Add reference number and date
        doc.fontSize(12)
           .text(`Reference: ${complaint.resolutionReference || `RES-${complaintId.slice(-6)}`}`, { align: 'right' })
           .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
           .moveDown(2);
        
        // Add complaint details
        doc.fontSize(14)
           .text('Complaint Details', { underline: true })
           .moveDown();
        
        if (isEmployeeComplaint) {
            doc.fontSize(12)
               .text(`Employee: ${complaint.isAnonymous ? 'Anonymous' : complaint.employeeName}`)
               .text(`Department: ${complaint.department}`)
               .text(`Complaint Type: ${complaint.complaintType}`)
               .text(`Urgency: ${complaint.urgency}`)
               .moveDown();
        } else {
            doc.fontSize(12)
               .text(`User ID: ${complaint.userId}`)
               .moveDown();
        }
        
        // Add complaint text
        doc.fontSize(12)
           .text('Description of Complaint:')
           .moveDown(0.5);
        
        doc.fontSize(11)
           .text(complaint.complaintText, {
               width: 500,
               align: 'justify'
           })
           .moveDown(2);
        
        // Add resolution
        doc.fontSize(14)
           .text('Official Resolution', { underline: true })
           .moveDown();
        
        doc.fontSize(11)
           .text(complaint.resolutionText, {
               width: 500,
               align: 'justify'
           })
           .moveDown(2);
        
        // Add action items if available
        if (complaint.actionItems && complaint.actionItems.length > 0) {
            doc.fontSize(14)
               .text('Action Items', { underline: true })
               .moveDown();
            
            complaint.actionItems.forEach((item, index) => {
                doc.fontSize(11)
                   .text(`${index + 1}. ${item.action}`)
                   .text(`   Assigned to: ${item.assignedTo}`, { indent: 20 })
                   .text(`   Due: ${item.dueDate || 'As soon as possible'}`, { indent: 20 })
                   .moveDown(0.5);
            });
            
            doc.moveDown();
        }
        
        // Add follow-up information
        if (complaint.followUpDate) {
            doc.fontSize(12)
               .text(`Follow-up Date: ${new Date(complaint.followUpDate).toLocaleDateString()}`)
               .moveDown();
        }
        
        // Add signature lines
        doc.moveDown(4);
        doc.fontSize(11)
           .text('______________________________', { align: 'left' })
           .text('HR Representative Signature', { align: 'left' })
           .moveDown(2);
        
        doc.fontSize(11)
           .text('______________________________', { align: 'right' })
           .text('Department Manager Signature', { align: 'right' });
        
        // Add footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            
            // Add page number
            doc.fontSize(8)
               .text(
                   `Page ${i + 1} of ${pageCount}`,
                   doc.page.margins.left,
                   doc.page.height - 50,
                   { align: 'center' }
               );
               
            // Add confidentiality notice
            doc.fontSize(8)
               .text(
                   'CONFIDENTIAL: This document contains sensitive information related to an employee complaint. Do not distribute.',
                   doc.page.margins.left,
                   doc.page.height - 30,
                   { align: 'center' }
               );
        }
        
        // Finalize PDF
        doc.end();
        
    } catch (error) {
        console.error('Error generating resolution document:', error);
        res.status(500).json({ 
            message: 'Error generating resolution document', 
            error: error.message 
        });
    }
};

// Helper function to generate appropriate action items based on complaint type
const generateActionItems = (complaintType) => {
    const defaultActions = [
        { action: "Document all communications", assignedTo: "HR", dueDate: null },
        { action: "Schedule follow-up meeting", assignedTo: "Department Admin", dueDate: null }
    ];
    
    switch(complaintType) {
        case 'Workplace Harassment':
            return [
                { action: "Arrange meeting with Admin and HR", assignedTo: "HR Director", dueDate: "24 hours" },
                { action: "Implement protective measures", assignedTo: "Department Admin", dueDate: "24 hours" },
                { action: "Schedule separate interviews", assignedTo: "HR", dueDate: "3 days" },
                ...defaultActions
            ];
        case 'Pay Issues':
            return [
                { action: "Audit payment records", assignedTo: "Finance", dueDate: "3 days" },
                { action: "Verify overtime calculations", assignedTo: "Payroll", dueDate: "3 days" },
                { action: "Consult compliance requirements", assignedTo: "Admin", dueDate: "1 week" },
                ...defaultActions
            ];
        // Add cases for other complaint types
        default:
            return defaultActions;
    }
};

// Helper function to send email notification

// New endpoint to handle HR admin forwarding to AI system
export const forwardToAI = async (req, res) => {
    try {
        const { complaintId } = req.body;
        
        if (!complaintId) {
            return res.status(400).json({ message: 'Complaint ID is required' });
        }
        
        // Find the complaint in either collection
        let complaint = await Complaint.findById(complaintId);
        let isEmployeeComplaint = false;
        
        if (!complaint) {
            complaint = await EmployeeComplaint.findById(complaintId);
            isEmployeeComplaint = true;
            
            if (!complaint) {
                return res.status(404).json({ message: 'Complaint not found' });
            }
        }
        
        // Mark as requiring AI resolution
        complaint.requiresAI = true;
        complaint.status = 'Needs AI Review';
        complaint.hrNotes = req.body.hrNotes || 'Forwarded to AI resolution by HR';
        
        await complaint.save();
        
        // Return the updated complaint
        const responseObj = complaint.toObject();
        responseObj.source = isEmployeeComplaint ? 'Employee Complaint' : 'General Complaint';
        
        res.status(200).json({
            success: true,
            complaint: responseObj,
            message: 'Complaint successfully forwarded to AI resolution system'
        });
        
    } catch (error) {
        console.error('Error in forwardToAI:', error);
        res.status(500).json({ message: 'Error forwarding complaint', error: error.message });
    }
};



//still unintegrated
export const getHRComplaints = async (req, res) => {
    try {
        // Only fetch complaints that DON'T require AI intervention
        const complaints = await Complaint.find({ requiresAI: false }).sort({ createdAt: -1 });
        const employeeComplaints = await EmployeeComplaint.find({ requiresAI: false }).sort({ createdAt: -1 });

        // Add source label to each item
        const labeledComplaints = complaints.map(c => ({
            ...c.toObject(),
            source: 'General Complaint'
        }));

        const labeledEmployeeComplaints = employeeComplaints.map(ec => ({
            ...ec.toObject(),
            source: 'Employee Complaint'
        }));

        // Combine and sort by creation date (newest first)
        const hrComplaints = [...labeledComplaints, ...labeledEmployeeComplaints]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ complaints: hrComplaints });
    } catch (error) {
        console.error('Error in getHRComplaints:', error);
        res.status(500).json({ message: 'Error fetching HR complaints', error: error.message });
    }
};

//