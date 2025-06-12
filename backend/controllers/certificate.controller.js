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

        // Colors
        const primaryGold = '#C9A96E';
        const darkGold = '#8B6914';
        const lightGold = '#F4E4BC';
        const textDark = '#2C3E50';
        const textLight = '#34495E';

        // Background with gradient effect
        doc.rect(0, 0, pageWidth, pageHeight)
           .fill('#FEFEFE');

        // Add subtle background pattern
        for (let i = 0; i < pageWidth; i += 100) {
            for (let j = 0; j < pageHeight; j += 100) {
                doc.circle(i, j, 1)
                   .fill('#F8F8F8');
            }
        }

        // Main border frame
        const borderWidth = 40;
        const innerBorderWidth = 8;

        // Outer border
        doc.rect(borderWidth, borderWidth, 
                pageWidth - (borderWidth * 2), 
                pageHeight - (borderWidth * 2))
           .lineWidth(4)
           .stroke(primaryGold);

        // Inner border
        doc.rect(borderWidth + innerBorderWidth, 
                borderWidth + innerBorderWidth, 
                pageWidth - ((borderWidth + innerBorderWidth) * 2), 
                pageHeight - ((borderWidth + innerBorderWidth) * 2))
           .lineWidth(2)
           .stroke(darkGold);

        // Decorative corner elements
        const cornerSize = 50;
        const corners = [
            { x: borderWidth + 20, y: borderWidth + 20 },
            { x: pageWidth - borderWidth - 20, y: borderWidth + 20 },
            { x: borderWidth + 20, y: pageHeight - borderWidth - 20 },
            { x: pageWidth - borderWidth - 20, y: pageHeight - borderWidth - 20 }
        ];

        corners.forEach(corner => {
            // Corner decoration
            doc.save()
               .translate(corner.x, corner.y);
            
            // Decorative corner flourish
            doc.path('M0,0 L20,0 L20,20 L0,20 Z')
               .fill(lightGold);
            
            doc.path('M0,0 Q10,-10 20,0 Q10,10 0,20 Q-10,10 0,0')
               .fill(primaryGold);
            
            doc.restore();
        });

        // Header section
        const headerY = borderWidth + 50;
        
        // Institution/Organization name
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .fillColor(darkGold)
           .text('SKILLSUTRA ACADEMY', centerX - 100, headerY, { width: 200, align: 'center' });

        // Certificate title
        doc.font('Helvetica-Bold')
           .fontSize(42)
           .fillColor(primaryGold)
           .text('CERTIFICATE', centerX - 150, headerY + 35, { width: 300, align: 'center' });

        doc.fontSize(28)
           .text('OF COMPLETION', centerX - 120, headerY + 85, { width: 240, align: 'center' });

        // Decorative line under title
        const lineY = headerY + 130;
        doc.moveTo(centerX - 120, lineY)
           .lineTo(centerX + 120, lineY)
           .lineWidth(2)
           .stroke(primaryGold);

        // Add decorative elements on the line
        doc.circle(centerX - 120, lineY, 3).fill(darkGold);
        doc.circle(centerX, lineY, 4).fill(primaryGold);
        doc.circle(centerX + 120, lineY, 3).fill(darkGold);

        // Main content section
        const contentY = lineY + 35;

        // "This is to certify that" text
        doc.font('Helvetica')
           .fontSize(16)
           .fillColor(textLight)
           .text('This is to certify that', centerX - 100, contentY, { width: 200, align: 'center' });

        // User name - make it prominent
        const userName = user.name || (user.firstName + ' ' + (user.lastName || '')) || 'Student Name';
        doc.font('Helvetica-Bold')
           .fontSize(32)
           .fillColor(textDark)
           .text(userName.toUpperCase(), centerX - 200, contentY + 30, { width: 400, align: 'center' });

        // Add underline under name
        const nameUnderlineY = contentY + 70;
        doc.moveTo(centerX - 150, nameUnderlineY)
           .lineTo(centerX + 150, nameUnderlineY)
           .lineWidth(1)
           .stroke(primaryGold);

        // "has successfully completed" text
        doc.font('Helvetica')
           .fontSize(16)
           .fillColor(textLight)
           .text('has successfully completed the course', centerX - 150, nameUnderlineY + 20, { width: 300, align: 'center' });

           console.log(progress.courseId);
        // Course title
        const courseTitle = course.courseTitle || 'Web Development Course';
        doc.font('Helvetica-Bold')
           .fontSize(24)
           .fillColor(darkGold)
           .text(courseTitle, centerX - 200, nameUnderlineY + 50, { width: 400, align: 'center' });

        // Decorative line after course title
        doc.moveTo(centerX - 100, nameUnderlineY + 85)
           .lineTo(centerX + 100, nameUnderlineY + 85)
           .lineWidth(1)
           .stroke(primaryGold);

        // Bottom section with details
        const bottomSectionY = pageHeight - 120;
        
        // Certificate details - left side
        doc.font('Helvetica')
           .fontSize(11)
           .fillColor(textLight)
           .text('Certificate Number:', borderWidth + 60, bottomSectionY);
        
        doc.font('Helvetica-Bold')
           .fontSize(11)
           .fillColor(textDark)
           .text(`SKILL-${certificate.certificateNumber}`, borderWidth + 60, bottomSectionY + 15);

        doc.font('Helvetica')
           .fontSize(11)
           .fillColor(textLight)
           .text('Date of Completion:', borderWidth + 60, bottomSectionY + 35);
        
        doc.font('Helvetica-Bold')
           .fontSize(11)
           .fillColor(textDark)
           .text(new Date().toLocaleDateString('en-US', { 
               year: 'numeric', 
               month: 'long', 
               day: 'numeric' 
           }), borderWidth + 60, bottomSectionY + 50);

        // Signature section - right side
        const signatureX = pageWidth - borderWidth - 200;
        
        const signatureImagePath = path.resolve('assets/signature.png');
        const imageWidth = 140;
        const imageHeight = 60;
        const imageX = signatureX + (180 - imageWidth) / 2;
        const imageY = bottomSectionY - 45; // Move a bit higher above the line
        
        doc.image(signatureImagePath, imageX, imageY, {
            width: imageWidth,
            height: imageHeight
        });

        // Signature line
        doc.moveTo(signatureX, bottomSectionY + 30)
           .lineTo(signatureX + 180, bottomSectionY + 30)
           .lineWidth(1)
           .stroke(textLight);

        // Signature text
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor(textLight)
           .text('Authorized Signature', signatureX, bottomSectionY + 35, { width: 180, align: 'center' });

        doc.font('Helvetica-Bold')
           .fontSize(11)
           .fillColor(textDark)
           .text('Director of SkillSutra', signatureX, bottomSectionY + 50, { width: 180, align: 'center' });

        // Footer verification text
        doc.font('Helvetica')
           .fontSize(9)
           .fillColor(textLight)
           .text('This certificate can be verified online', centerX - 100, pageHeight - 30, { width: 200, align: 'center' });

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