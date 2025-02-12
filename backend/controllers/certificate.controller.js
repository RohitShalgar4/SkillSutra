// controllers/certificate.controller.js
import Certificate from '../models/certificate.model.js';
import { CourseProgress } from '../models/courseProgress.js';
import PDFDocument from 'pdfkit';

export const generateCertificate = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        console.log('Generating certificate for:', { userId, courseId });

        // Check if course is completed
        const progress = await CourseProgress.findOne({ 
            userId, 
            courseId,
            completed: true 
        }).populate('courseId', 'courseTitle');

        console.log('Course progress:', progress);

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
            margin: 0  // Set margin to 0 to have full control
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

        // Calculate center points and dimensions
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const centerX = pageWidth / 2;
        const centerY = pageHeight / 2;

        // Add background color with a slight cream tint
        doc.rect(0, 0, pageWidth, pageHeight)
           .fill('#fffdf7');

        // Add decorative golden border pattern
        const goldColor = '#D4AF37';
        const darkGold = '#B8860B';
        const lightGold = '#FFD700';

        // Border margins
        const borderMargin = 40;

        // Outer decorative border
        doc.rect(borderMargin, borderMargin, pageWidth - (borderMargin * 2), pageHeight - (borderMargin * 2))
           .lineWidth(3)
           .stroke(goldColor);

        // Inner decorative border
        doc.rect(borderMargin + 10, borderMargin + 10, pageWidth - ((borderMargin + 10) * 2), pageHeight - ((borderMargin + 10) * 2))
           .lineWidth(1)
           .stroke(goldColor);

        // Add classical corner decorations
        const drawClassicalCorner = (x, y, rotation) => {
            doc.save()
               .translate(x, y)
               .rotate(rotation);

            // Decorative scroll pattern
            doc.path('M0,0 C15,-10 30,-10 40,0 C50,10 60,10 70,0')
               .stroke(goldColor);
            doc.path('M0,10 C15,0 30,0 40,10 C50,20 60,20 70,10')
               .stroke(goldColor);

            // Corner flourish
            doc.path('M0,0 Q20,-20 40,0 T80,0')
               .stroke(goldColor);

            doc.restore();
        };

        // Add classical corners
        drawClassicalCorner(borderMargin + 20, borderMargin + 20, 0);
        drawClassicalCorner(pageWidth - (borderMargin + 20), borderMargin + 20, 90);
        drawClassicalCorner(borderMargin + 20, pageHeight - (borderMargin + 20), -90);
        drawClassicalCorner(pageWidth - (borderMargin + 20), pageHeight - (borderMargin + 20), 180);

        // Add decorative header ornament
        const drawHeaderOrnament = () => {
            const y = borderMargin + 80;
            doc.save()
               .translate(centerX, y);
            
            // Central flourish
            doc.path('M-100,0 C-80,-20 -40,-20 0,0 C40,-20 80,-20 100,0')
               .stroke(goldColor);
            
            // Side scrolls
            doc.path('M-120,0 C-100,10 -80,10 -60,0')
               .stroke(goldColor);
            doc.path('M120,0 C100,10 80,10 60,0')
               .stroke(goldColor);
            
            doc.restore();
        };

        drawHeaderOrnament();

        // Calculate content area dimensions
        const contentWidth = pageWidth - (borderMargin * 4); // Leave space from borders
        const contentHeight = 400; // Approximate height of all content
        const contentStartY = centerY - (contentHeight / 2); // This centers the content block vertically

        // Add certificate heading
        doc.font('Helvetica-Bold')
           .fontSize(42)
           .fillColor(darkGold);

        // Certificate title with proper centering
        const titleY = contentStartY + 20; // Start a bit below the top of content area
        doc.text('Certificate of', {
            width: contentWidth,
            align: 'center',
            y: titleY
        });

        doc.text('Completion', {
            width: contentWidth,
            align: 'center',
            y: titleY + 50
        });

        // Add decorative line under title
        const lineWidth = 300;
        doc.moveTo(centerX - lineWidth/2, titleY + 100)
           .lineTo(centerX + lineWidth/2, titleY + 100)
           .lineWidth(2)
           .stroke(goldColor);

        // Add main text with proper centering
        doc.font('Helvetica')
           .fontSize(20)
           .fillColor('#333333')
           .text('This is to certify that', {
               width: contentWidth,
               align: 'center',
               y: titleY + 140
           });

        // Course title
        doc.font('Helvetica-Bold')
           .fontSize(28)
           .fillColor('#000000')
           .text(progress.courseId.courseTitle || 'Web Development', {
               width: contentWidth,
               align: 'center',
               y: titleY + 180
           });

        // Certificate details with proper centering
        doc.font('Helvetica')
           .fontSize(15)
           .fillColor('#666666')
           .text(`Certificate Number: SKILL-${certificate.certificateNumber}`, {
               width: contentWidth,
               align: 'center',
               y: titleY + 240
           })
           .text(`Completion Date: ${new Date().toLocaleDateString()}`, {
               width: contentWidth,
               align: 'center',
               y: titleY + 270
           });

        // Add signature in bottom right corner
        const signatureWidth = 200;
        const signatureMargin = borderMargin + 60; // Space from the border
        const signatureX = pageWidth - signatureMargin - signatureWidth; // Position from right
        const signatureY = pageHeight - signatureMargin - 40; // Position from bottom

        // Decorative line above signature
        doc.moveTo(signatureX, signatureY)
           .lineTo(signatureX + signatureWidth, signatureY)
           .lineWidth(1)
           .stroke(goldColor);

        // Add small decorative elements at line ends
        doc.circle(signatureX, signatureY, 2).fill(goldColor);
        doc.circle(signatureX + signatureWidth, signatureY, 2).fill(goldColor);

        // Add signature text
        doc.font('Helvetica')
           .fontSize(12)
           .fillColor(darkGold)
           .text('Authorized Signature', {
               width: signatureWidth,
               align: 'center',
               y: signatureY + 10
           });

        // Add bottom ornament
        const drawBottomOrnament = () => {
            const y = pageHeight - (borderMargin + 80);
            doc.save()
               .translate(centerX, y);
            
            // Mirror of header ornament
            doc.path('M-100,0 C-80,20 -40,20 0,0 C40,20 80,20 100,0')
               .stroke(goldColor);
            
            doc.path('M-120,0 C-100,-10 -80,-10 -60,0')
               .stroke(goldColor);
            doc.path('M120,0 C100,-10 80,-10 60,0')
               .stroke(goldColor);
            
            doc.restore();
        };

        drawBottomOrnament();

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