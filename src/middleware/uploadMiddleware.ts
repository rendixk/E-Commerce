import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = 'public/uploads'

if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
   destination: (req, res, cb) => {
      cb(null, uploadDir)
   },
   filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`)
   }
})

const upload = multer({
   storage: storage,
   fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png/
      const mimetype = filetypes.test(file.mimetype)
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

      if(mimetype && extname) {
         return cb(null, true)
      }
      cb(new Error(`Error: File upload only supports the following filetypes - ${filetypes}`))
   }
})

export default upload