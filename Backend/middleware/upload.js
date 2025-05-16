import multer from 'multer';
import path from 'path';

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
        cb(null, true);
    } else {
        cb(new Error('Only .csv, .xlsx, and .xls files are allowed'), false);
    }
};

const storage = multer.memoryStorage(); 

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export default upload;
