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

        // Professional color scheme inspired by industry standards
        const primaryGold = '#B8860B';
        const secondaryGold = '#D4AF37';
        const accentGold = '#FFD700';
        const darkBlue = '#2C3E50';
        const mediumBlue = '#34495E';
        const lightBlue = '#ECF0F1';
        const textDark = '#2C3E50';
        const textMedium = '#5D6D7E';
        const borderColor = '#E5E7EB';

        // Premium background with subtle gradient
        const gradient = doc.linearGradient(0, 0, pageWidth, pageHeight);
        gradient.stop(0, '#FEFEFE');
        gradient.stop(1, '#FAFAFA');
        
        doc.rect(0, 0, pageWidth, pageHeight).fill(gradient);

        // Add subtle watermark pattern in the background
        doc.save();
        doc.opacity(0.03);
        for (let i = -100; i < pageWidth + 200; i += 150) {
            for (let j = -100; j < pageHeight + 200; j += 150) {
                doc.circle(i, j, 40).fill(primaryGold);
            }
        }
        doc.restore();

        // Main border design with multiple layers
        const borderWidth = 50;
        const innerBorderWidth = 3;
        const outerBorderWidth = 8;

        // Outer decorative border
        doc.rect(borderWidth, borderWidth, 
                pageWidth - (borderWidth * 2), 
                pageHeight - (borderWidth * 2))
           .lineWidth(outerBorderWidth)
           .stroke(primaryGold);

        // Middle border
        doc.rect(borderWidth + 15, borderWidth + 15, 
                pageWidth - ((borderWidth + 15) * 2), 
                pageHeight - ((borderWidth + 15) * 2))
           .lineWidth(2)
           .stroke(borderColor);

        // Inner border
        doc.rect(borderWidth + 25, borderWidth + 25, 
                pageWidth - ((borderWidth + 25) * 2), 
                pageHeight - ((borderWidth + 25) * 2))
           .lineWidth(innerBorderWidth)
           .stroke(secondaryGold);

        // Decorative corner elements - more sophisticated design
        const cornerSize = 80;
        const cornerRadius = 15;
        const corners = [
            { x: borderWidth + 25, y: borderWidth + 25 },
            { x: pageWidth - borderWidth - 25, y: borderWidth + 25 },
            { x: borderWidth + 25, y: pageHeight - borderWidth - 25 },
            { x: pageWidth - borderWidth - 25, y: pageHeight - borderWidth - 25 }
        ];

        corners.forEach((corner, index) => {
            doc.save()
               .translate(corner.x, corner.y);
            
            // Rotate corners 2 and 3 to face inward
            if (index === 1) doc.rotate(90);
            if (index === 2) doc.rotate(-90);
            if (index === 3) doc.rotate(180);
            
            // Elegant corner design
            doc.path('M0,0 L20,0 L20,20 L0,20 Z')
               .fill(lightBlue);
            
            doc.circle(10, 10, 8)
               .fill(primaryGold);
            
            doc.circle(10, 10, 4)
               .fill(accentGold);
            
            doc.restore();
        });

        // Header section with improved typography
        const headerY = borderWidth + 70;
        
        // Institution name with better styling
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .fillColor(mediumBlue)
           .text('SKILLSUTRA ACADEMY', centerX, headerY, { 
               width: 300, 
               align: 'center',
               characterSpacing: 1.5
            });

        // Certificate title with enhanced typography
        const titleY = headerY + 40;
        doc.font('Helvetica-Bold')
           .fontSize(48)
           .fillColor(primaryGold)
           .text('CERTIFICATE', centerX, titleY, { 
               width: 400, 
               align: 'center',
               characterSpacing: 2
            });

        doc.font('Helvetica-Bold')
           .fontSize(28)
           .fillColor(darkBlue)
           .text('OF COMPLETION', centerX, titleY + 60, { 
               width: 300, 
               align: 'center',
               characterSpacing: 1
            });

        // Decorative elements under title
        const lineY = titleY + 110;
        
        // Triple line decoration
        doc.moveTo(centerX - 150, lineY)
           .lineTo(centerX + 150, lineY)
           .lineWidth(1)
           .stroke(mediumBlue);

        doc.moveTo(centerX - 120, lineY + 4)
           .lineTo(centerX + 120, lineY + 4)
           .lineWidth(2)
           .stroke(primaryGold);

        doc.moveTo(centerX - 90, lineY + 8)
           .lineTo(centerX + 90, lineY + 8)
           .lineWidth(1)
           .stroke(mediumBlue);

        // Main content section with better spacing
        const contentStartY = lineY + 50;

        // "This is to certify that" text
        doc.font('Helvetica')
           .fontSize(18)
           .fillColor(textMedium)
           .text('This is to certify that', centerX, contentStartY, { 
               width: 400, 
               align: 'center',
               lineGap: 5
            });

        // User name - more prominent and elegant
        const userName = user.name || (user.firstName + ' ' + (user.lastName || '')) || 'Student Name';
        const userNameY = contentStartY + 40;
        
        doc.font('Helvetica-Bold')
           .fontSize(36)
           .fillColor(textDark)
           .text(userName.toUpperCase(), centerX, userNameY, { 
               width: 500, 
               align: 'center',
               characterSpacing: 1.2
            });

        // Decorative underline for name
        const nameUnderlineY = userNameY + 50;
        doc.moveTo(centerX - 180, nameUnderlineY)
           .lineTo(centerX + 180, nameUnderlineY)
           .lineWidth(2)
           .stroke(secondaryGold);

        // Add decorative elements on the name underline
        for (let i = -180; i <= 180; i += 30) {
            if (i % 60 === 0) {
                doc.circle(centerX + i, nameUnderlineY, 2)
                   .fill(primaryGold);
            }
        }

        // Completion text
        doc.font('Helvetica')
           .fontSize(16)
           .fillColor(textMedium)
           .text('has successfully completed the course', centerX, nameUnderlineY + 25, { 
               width: 400, 
               align: 'center'
            });

        // Course title section
        const courseTitle = course.courseTitle || 'Web Development Course';
        const courseTitleY = nameUnderlineY + 60;
        
        doc.font('Helvetica-Bold')
           .fontSize(24)
           .fillColor(darkBlue)
           .text(`"${courseTitle}"`, centerX, courseTitleY, { 
               width: 500, 
               align: 'center',
               lineGap: 5
            });

        // Achievement text
        doc.font('Helvetica-Oblique')
           .fontSize(14)
           .fillColor(textMedium)
           .text('demonstrating proficiency and commitment to learning', centerX, courseTitleY + 45, { 
               width: 450, 
               align: 'center'
            });

        // Date and details section
        const detailsY = pageHeight - 150;
        
        // Left side - Certificate details
        const leftDetailsX = borderWidth + 60;
        
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .fillColor(mediumBlue)
           .text('CERTIFICATE ID', leftDetailsX, detailsY);
        
        doc.font('Helvetica')
           .fontSize(11)
           .fillColor(textMedium)
           .text(certificate.certificateNumber, leftDetailsX, detailsY + 18);

        doc.font('Helvetica-Bold')
           .fontSize(12)
           .fillColor(mediumBlue)
           .text('DATE OF COMPLETION', leftDetailsX, detailsY + 45);
        
        const completionDate = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        doc.font('Helvetica')
           .fontSize(11)
           .fillColor(textMedium)
           .text(completionDate, leftDetailsX, detailsY + 63);

        // Right side - Signature area
        const signatureX = pageWidth - borderWidth - 200;
        
        // Signature image with fallback
        try {
            const signatureImagePath = path.resolve('assets/signature.png');
            const signatureWidth = 120;
            const signatureHeight = 50;
            const signatureImageX = signatureX + (180 - signatureWidth) / 2;
            const signatureImageY = detailsY - 10;
            
            doc.image(signatureImagePath, signatureImageX, signatureImageY, {
                width: signatureWidth,
                height: signatureHeight
            });
        } catch (error) {
            console.log('Signature image not found, using text signature');
            // Fallback signature line
            doc.moveTo(signatureX + 30, detailsY + 5)
               .lineTo(signatureX + 150, detailsY + 5)
               .lineWidth(1)
               .stroke(textDark);
        }

        // Signature text
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .fillColor(darkBlue)
           .text('Sarah Johnson', signatureX, detailsY + 20, { width: 180, align: 'center' });

        doc.font('Helvetica')
           .fontSize(11)
           .fillColor(textMedium)
           .text('Director of Education', signatureX, detailsY + 38, { width: 180, align: 'center' });

        doc.font('Helvetica')
           .fontSize(10)
           .fillColor(textMedium)
           .text('SkillSutra Academy', signatureX, detailsY + 55, { width: 180, align: 'center' });

        // Central seal/logo
        try {
            const sealImagePath = path.resolve('assets/seal.png');
            const sealSize = 100;
            const sealX = centerX - (sealSize / 2);
            const sealY = detailsY - 120;
            
            doc.image(sealImagePath, sealX, sealY, {
                width: sealSize,
                height: sealSize
            });
        } catch (error) {
            console.log('Seal image not found, creating decorative seal');
            // Create a decorative seal as fallback
            const sealSize = 80;
            const sealX = centerX - (sealSize / 2);
            const sealY = detailsY - 110;
            
            doc.circle(centerX, sealY + sealSize/2, sealSize/2)
               .lineWidth(2)
               .stroke(primaryGold);
            
            doc.circle(centerX, sealY + sealSize/2, sealSize/2 - 10)
               .lineWidth(1)
               .stroke(secondaryGold);
            
            doc.font('Helvetica-Bold')
               .fontSize(10)
               .fillColor(primaryGold)
               .text('OFFICIAL', centerX, sealY + sealSize/2 - 15, { width: 60, align: 'center' });
            
            doc.font('Helvetica-Bold')
               .fontSize(10)
               .fillColor(primaryGold)
               .text('SEAL', centerX, sealY + sealSize/2, { width: 60, align: 'center' });
        }

        // Footer with verification information
        const footerY = pageHeight - 40;
        
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor(textMedium)
           .text('This certificate verifies that the above individual has completed the mentioned course.', centerX, footerY, { 
               width: 500, 
               align: 'center'
            });

        doc.font('Helvetica-Oblique')
           .fontSize(9)
           .fillColor(mediumBlue)
           .text(`Verify at: skillsutra.com/verify/${certificate.certificateNumber}`, centerX, footerY + 15, { 
               width: 400, 
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