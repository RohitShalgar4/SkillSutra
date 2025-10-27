// controllers/certificate.controller.js
import Certificate from '../models/certificate.model.js';
import { CourseProgress } from '../models/courseProgress.js';
import { User } from '../models/user.model.js'; // Add this import for user details
import PDFDocument from 'pdfkit';
import { Course } from '../models/course.model.js';
import path from 'path';

export const generateCertificate = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        console.log('Generating certificate for:', { userId, courseId });

        // Get user details
        const user = await User.findById(userId).select('name firstName lastName email');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if course is completed
        const progress = await CourseProgress.findOne({ 
            userId, 
            courseId,
            completed: true 
        }).populate('courseId', 'courseTitle instructor duration');

        console.log('Course progress:', progress);

        const course = await Course.findById(courseId).select('courseTitle');
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        if (!progress) {
            return res.status(400).json({
                success: false,
                message: "Course not completed yet"
            });
        }

        // Check if certificate already exists
        let certificate = await Certificate.findOne({ userId, courseId });
        
        console.log('Existing certificate:', certificate);

        if (!certificate) {
            certificate = await Certificate.create({ userId, courseId });
            console.log('New certificate created:', certificate);
        }

        // Create an array to store PDF chunks
        const chunks = [];
        
        // Generate PDF certificate
        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margin: 0
        });

        // Collect PDF data chunks
        doc.on('data', chunk => chunks.push(chunk));
        
        // When PDF is done, send it to client
        doc.on('end', () => {
            const result = Buffer.concat(chunks);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.certificateNumber}.pdf`);
            res.send(result);
        });

        // Page dimensions
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const centerX = pageWidth / 2;

        // Professional color palette (inspired by Coursera/Udemy)
        const primaryBlue = '#0056D2';
        const accentGold = '#B8860B';
        const softGray = '#F5F7FA';
        const textDark = '#1A1A1A';
        const textMedium = '#4A4A4A';
        const textLight = '#7A7A7A';
        const borderColor = '#E0E0E0';

        // Create elegant background
        doc.rect(0, 0, pageWidth, pageHeight)
           .fill('#FFFFFF');

        // Add subtle geometric pattern in background
        doc.opacity(0.03);
        for (let i = 0; i < pageWidth; i += 60) {
            for (let j = 0; j < pageHeight; j += 60) {
                doc.circle(i, j, 2).fill(primaryBlue);
            }
        }
        doc.opacity(1);

        // Add soft gradient effect at top
        doc.rect(0, 0, pageWidth, 180)
           .fill(softGray)
           .opacity(0.5);
        doc.opacity(1);

        // Professional border frame
        const outerMargin = 35;
        const innerMargin = 42;

        // Outer elegant border
        doc.rect(outerMargin, outerMargin, 
                pageWidth - (outerMargin * 2), 
                pageHeight - (outerMargin * 2))
           .lineWidth(1)
           .stroke(borderColor);

        // Inner accent border
        doc.rect(innerMargin, innerMargin, 
                pageWidth - (innerMargin * 2), 
                pageHeight - (innerMargin * 2))
           .lineWidth(3)
           .stroke(primaryBlue);

        // Add corner accent decorations
        const cornerMargin = innerMargin + 10;
        const cornerLength = 40;
        
        // Top-left corner
        doc.moveTo(cornerMargin, cornerMargin + cornerLength)
           .lineTo(cornerMargin, cornerMargin)
           .lineTo(cornerMargin + cornerLength, cornerMargin)
           .lineWidth(2)
           .stroke(accentGold);

        // Top-right corner
        doc.moveTo(pageWidth - cornerMargin, cornerMargin + cornerLength)
           .lineTo(pageWidth - cornerMargin, cornerMargin)
           .lineTo(pageWidth - cornerMargin - cornerLength, cornerMargin)
           .lineWidth(2)
           .stroke(accentGold);

        // Bottom-left corner
        doc.moveTo(cornerMargin, pageHeight - cornerMargin - cornerLength)
           .lineTo(cornerMargin, pageHeight - cornerMargin)
           .lineTo(cornerMargin + cornerLength, pageHeight - cornerMargin)
           .lineWidth(2)
           .stroke(accentGold);

        // Bottom-right corner
        doc.moveTo(pageWidth - cornerMargin, pageHeight - cornerMargin - cornerLength)
           .lineTo(pageWidth - cornerMargin, pageHeight - cornerMargin)
           .lineTo(pageWidth - cornerMargin - cornerLength, pageHeight - cornerMargin)
           .lineWidth(2)
           .stroke(accentGold);

        // Header section
        const headerY = 65;
        
        // Institution name at top
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .fillColor(primaryBlue)
           .text('SKILLSUTRA ACADEMY', centerX - 120, headerY, { 
               width: 240, 
               align: 'center' 
           });

        // Main certificate title
        const titleY = headerY + 35;
        
        doc.font('Helvetica-Bold')
           .fontSize(48)
           .fillColor(textDark)
           .text('Certificate of Completion', centerX - 280, titleY, { 
               width: 560, 
               align: 'center',
               lineGap: 2
           });

        // Elegant divider line
        const dividerY = titleY + 60;
        const dividerWidth = 180;
        
        doc.moveTo(centerX - dividerWidth, dividerY)
           .lineTo(centerX - 20, dividerY)
           .lineWidth(2)
           .stroke(primaryBlue);
        
        doc.circle(centerX, dividerY, 4)
           .fill(accentGold);
        
        doc.moveTo(centerX + 20, dividerY)
           .lineTo(centerX + dividerWidth, dividerY)
           .lineWidth(2)
           .stroke(primaryBlue);

        // Content section
        const contentY = dividerY + 35;

        // "This certifies that" text - smaller to avoid overlap
        doc.font('Helvetica')
           .fontSize(13)
           .fillColor(textMedium)
           .text('This is to certify that', centerX - 150, contentY, { 
               width: 300, 
               align: 'center' 
           });

        // User name - prominent display
        const userName = user.name || (user.firstName + ' ' + (user.lastName || '')) || 'Student Name';
        doc.font('Helvetica-Bold')
           .fontSize(36)
           .fillColor(primaryBlue)
           .text(userName, centerX - 280, contentY + 28, { 
               width: 560, 
               align: 'center',
               lineGap: 2
           });

        // Elegant underline under name
        const nameUnderlineY = contentY + 72;
        doc.moveTo(centerX - 200, nameUnderlineY)
           .lineTo(centerX + 200, nameUnderlineY)
           .lineWidth(0.5)
           .stroke(borderColor);

        // Achievement text
        doc.font('Helvetica')
           .fontSize(15)
           .fillColor(textMedium)
           .text('has successfully completed', centerX - 150, nameUnderlineY + 18, { 
               width: 300, 
               align: 'center' 
           });

        // Course title - professional display
        const courseTitle = course.courseTitle || 'Web Development Course';
        doc.font('Helvetica-Bold')
           .fontSize(26)
           .fillColor(textDark)
           .text(courseTitle, centerX - 300, nameUnderlineY + 45, { 
               width: 600, 
               align: 'center',
               lineGap: 3
           });

        // Course completion date
        const completionDate = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        doc.font('Helvetica')
           .fontSize(13)
           .fillColor(textLight)
           .text(`Completed on ${completionDate}`, centerX - 150, nameUnderlineY + 85, { 
               width: 300, 
               align: 'center' 
           });

        // Bottom section with credentials
        const bottomY = pageHeight - 110;
        
        // Left section - Certificate ID (removed QR code)
        const leftX = 80;
        
        doc.font('Helvetica')
           .fontSize(9)
           .fillColor(textLight)
           .text('CERTIFICATE ID', leftX, bottomY);
        
        doc.font('Helvetica-Bold')
           .fontSize(11)
           .fillColor(textDark)
           .text(certificate.certificateNumber, leftX, bottomY + 13);

        // Right section - Signature (moved lower)
        const rightX = pageWidth - 220;
        
        // Try to add signature image if it exists
        try {
            const signatureImagePath = path.resolve('assets/signature.png');
            doc.image(signatureImagePath, rightX + 20, bottomY - 15, {
                width: 120,
                height: 50,
                align: 'center'
            });
        } catch (err) {
            // If signature image doesn't exist, create a placeholder
            doc.font('Helvetica-Oblique')
               .fontSize(20)
               .fillColor(textMedium)
               .text('Signature', rightX + 40, bottomY);
        }

        // Signature line
        doc.moveTo(rightX, bottomY + 45)
           .lineTo(rightX + 160, bottomY + 45)
           .lineWidth(0.5)
           .stroke(borderColor);

        // Signature details
        doc.font('Helvetica-Bold')
           .fontSize(11)
           .fillColor(textDark)
           .text('Director', rightX, bottomY + 51, { 
               width: 160, 
               align: 'center' 
           });

        doc.font('Helvetica')
           .fontSize(9)
           .fillColor(textLight)
           .text('SkillSutra Academy', rightX, bottomY + 65, { 
               width: 160, 
               align: 'center' 
           });

        // Add stamp if available
        try {
            const stampImagePath = path.resolve('assets/Stamp.png');
            const stampSize = 75;
            doc.image(stampImagePath, centerX - stampSize/2, bottomY - 10, {
                width: stampSize,
                height: stampSize,
                opacity: 0.6
            });
        } catch (err) {
            // If stamp doesn't exist, create a circular placeholder
            doc.circle(centerX, bottomY + 25, 30)
               .lineWidth(2)
               .stroke(accentGold)
               .opacity(0.5);
            
            doc.font('Helvetica-Bold')
               .fontSize(8)
               .fillColor(accentGold)
               .text('OFFICIAL', centerX - 20, bottomY + 20, {
                   width: 40,
                   align: 'center'
               })
               .opacity(1);
        }

        // Footer verification notice
        doc.font('Helvetica')
           .fontSize(8)
           .fillColor(textLight)
           .text('This certificate can be verified at www.skillsutra.com/verify', 
                 centerX - 150, pageHeight - 25, { 
                     width: 300, 
                     align: 'center' 
                 });

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error('Certificate generation error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: "Failed to generate certificate",
            error: error.message
        });
    }
};

export const validateCertificate = async (req, res) => {
    try {
        const { certificateNumber } = req.params;

        // Find the certificate and populate user and course details
        const certificate = await Certificate.findOne({ certificateNumber })
            .populate('userId', 'username')
            .populate('courseId', 'courseTitle courseLevel category');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Invalid Certificate Number"
            });
        }

        const user = await User.findOne(certificate.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid User ID"
            });
        }

        // Return the certificate details
        return res.status(200).json({
            success: true,
            data: {
                username: user.name,
                courseTitle: certificate.courseId.courseTitle,
                courseLevel: certificate.courseId.courseLevel,
                category: certificate.courseId.category,
                completionDate: certificate.completionDate
            }
        });
        console.log(res.data);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error validating certificate",
            error: error.message
        });
    }
};

// // Example: Download certificate using fetch (no RTK Query, no Redux store)
// export const handleDownloadCertificate = async (courseId) => {
//   try {
//     const response = await fetch(`http://localhost:8080/api/v1/certificates/${courseId}/generate`, {
//       method: 'POST',
//       credentials: 'include',
//       headers: {
//         'Accept': 'application/pdf'
//       }
//     });
//     if (!response.ok) throw new Error('Failed to download certificate');
//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `certificate-${courseId}.pdf`;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     window.URL.revokeObjectURL(url);
//   } catch (err) {
//     console.error('Certificate download error:', err);
//     alert('Failed to download certificate');
//   }
// };