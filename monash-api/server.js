import express from 'express'
import 'dotenv/config'
import morgan from 'morgan'
import db from './db/connection.js'
import { response } from './utils/response.js'
import { validNoKp, validEmail, validId, validCourseCode, validMatricNo } from './utils/validator.js'

const app = express()
const PORT = process.env.PORT


if (process.env.MORGAN_LOG === 'production') {
  app.use(morgan('combined'))
} else {
  app.use(morgan('dev'))
}

app.use(express.json()) // better than body-parser

app.get('/', (req, res) => {
    response(200, 'ini data', 'message success', res)
    // res.status(200)
})

// app.get('/student/:name', (req, res) => {
//     const studentName = req.params.name
//     res.send( `Welcome ${studentName} !`)
// })


app.get('/students', (req, res) => {
    const queryAllStudent = `SELECT * FROM student`
    db.query(queryAllStudent, (err, result) => {
        if (err) {
            console.error(`ERROR: ${err.message}`)
            return response(500, null, 'Server error', res, 'SERVER_ERROR')
        }
        response(200, result, 'message succcess all student', res)
    })
})

app.get('/students/:studentId', (req, res) => {
    const student_Id = req.params.studentId
    
    if (!validId(student_Id)) {
        return response(400, null, 'Invalid student id', res, 'INVALID_STUDENT_ID')
    }

    const queryNoKp = `SELECT * FROM student WHERE student_id = ?`
    db.query(queryNoKp, [student_Id], (err, result) => {
        if (err) {
            console.error(`ERROR: ${err.message}`)
            return response(500, null, 'Server error', res, 'SERVER_ERROR')
        }
        if (result.length === 0) {
            return response(404, null, 'Student not found', res, 'STUDENT_NOT_FOUND')
        }

        response(200, result, 'message ok', res)
    })
})


// [studentId]	Ganti ? (placeholders)
// ? = Array
// Array	    Support multiple placeholders

app.get('/ndp/:matricNo', (req, res) => {
    const params_ndp = req.params.matricNo

    if (!validMatricNo(params_ndp)) {
        return response(400, null, 'Invalid Student Matric' , res, 'INVALID_STUDENT_MATRIC')
    }
    const queryNdp = `
        SELECT matric_no, student_name
        FROM student
        WHERE matric_no = ?`
        // ${ndp} -> ? placeholder

    db.query(queryNdp, [params_ndp], (err, result) => {
        if (err) {
            console.error(`ERROR: ${err.message}`)
            return response(500, null, 'Server error', res, 'SERVER_ERROR')
        }
        if (result.length === 0) {
            return response(404, null, 'Student not found', res, 'STUDENT_NOT_FOUND')
        }
        response(200, result, 'by ndp', res)
    })
})


app.get('/courses', (req, res) => {
    const queryAllCourse = `SELECT  * FROM courses`
    db.query(queryAllCourse, (err, result) => {
        if (err) {
            console.error(`ERROR: ${err.message}`)
            return response(500, null, 'Server error', res, 'SERVER_ERROR')
        }
        response(200, result, 'succcess all course', res)
    })
})

app.get('/courses/:courseCode', (req, res) => {
    const paramas_course_code = req.params.courseCode

    if (!validCourseCode(paramas_course_code)) {
        return response(400, null, 'Invalid Course Code', res, 'INVALID_COURSE_CODE')
    }

    const queryCourseNo = `SELECT * FROM courses WHERE course_code = ?`
    db.query(queryCourseNo, [paramas_course_code], (err, result) => {
        if (err) {
            console.error(`ERROR: ${err.message}`)
            return response(500, null, 'Server error', res, 'SERVER_ERROR')
        }
        if (result.length === 0) {
            return response(404, null, 'Course not found', res, 'COURSE_NOT_FOUND')
        }
        response(200, result, 'succcess', res)
    })
})

app.post('/students', (req, res) => {

    // conton FE convert data form → JSON
    // FE = Client → HTTP → BE = Server
    // Baris ni ambil data dari FE
     const {
        matric_no,
        no_kp,
        email,
        student_name,
        address,
        gender,
        course_id
    } = req.body
    console.log('body', req.body)

    if (!matric_no || !email || !student_name || !course_id || !no_kp) {
        return response(400, null, 'Invalid input', res, 'REQUIRED_ERROR')
    }

    if (!validMatricNo(matric_no)) {
        return response(400, null, 'Invalid Student Matric', res, 'INVALID_STUDENT_MATRIC')
    }

    if(!validEmail(email)) {
        return response(400, null, 'Invalid email input', res, 'INVALID_EMAIL')
    }

    if(!validNoKp(no_kp)) {
        return response(400, null, 'Invalid No KP input', res, 'INVALID_NO_KP')
    }

    if (!validId(course_id)) {
        return response(400, null, 'Invalid Course Id', res, 'INVALID_COURSE_ID')
    }

    const coursesCheck = 'SELECT 1 FROM courses WHERE course_id = ?'

    db.query(coursesCheck, [course_id], (err, result) => {
        if(err){
            console.error('err: ', err.message)
            return response(500, null, 'Server Error', res, 'SERVER_ERROR')
        }
        console.log('length: ', result)
        if(result.length === 0){
            return response(404, null, 'Course Not Found', res, "COURSE_NOT_FOUND")
        }
        console.log('length: ', result) // RowDataPacket { '1': 1 }


        const insertStudent = `
        INSERT INTO student (matric_no, no_kp, email, student_name, address, gender, course_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)`

        const values = [
            matric_no,
            no_kp,
            email,
            student_name,
            address || null,
            gender || null,
            course_id
        ]

        db.query(insertStudent, values,
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        console.error(`ERROR: ${err.message}`)
                        return response(409, null, 'Unable, Please check your information.', res, 'DUPLICATE_STUDENT')
                    }
                    console.error(`ERROR: ${err.message}`)
                    return response(500, null, `error `, res, 'SERVER_ERROR')
                }

            if (result.affectedRows !== 1) {
                console.error(`ERROR: affectedRows not equal to 1`)
                return response(400, null, 'Student not created', res, 'STUDENT_NOT_CREATED')
            }

            const dataResult = {
                dataRows: result.affectedRows,
                dataId: result.insertId
            }
            console.log('length: ', result) // OkPacket { :, :, ... }
            return response(201, dataResult, 'created ok', res)
        })
    })
})

app.post('/courses', (req, res) => {
    const {
        course_code,
        course_name
    } = req.body
    console.log(req.body)

    if ( !course_code|| !course_name) {
        return response(400, null, 'Required Error', res, 'REQUIRED_ERROR')
    }

    if (!validCourseCode(course_code)) {
        return response(400, null, 'Invalid Course Code', res, 'INVALID_COURSE_CODE')
    }

    const values = [
        course_code,
        course_name
    ]
    const insertCourses = 'INSERT INTO courses (course_code, course_name) VALUES (?, ?)'

    db.query(insertCourses, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return response(409, null, 'Duplicate Course', res, 'DUPLICATE_COURSE')
            }
            console.error('err: ', err.message)
            return response(500, null, 'Server Error', res, 'SERVER_ERROR')
        }
        return response(200, result, 'Create Updated Ok', res)
    })
})


// app.post('/students', (req, res) => {
    //     response(200, 'DATA', 'success',  res)
// })

app.put('/students', (req, res) => {
     const {
        student_id,
        matric_no,
        no_kp,
        email,
        student_name,
        address,
        gender,
        course_id
    } = req.body
    console.log('body', req.body)

    
    if (!student_id || !matric_no || !email || !student_name || !course_id || !no_kp) {
        return response(400, null, 'Invalid input', res, 'REQUIRED_ERROR')
    }

    if (!validId(student_id)) {
        return response(400, null, 'Invalid student id', res, 'INVALID_STUDENT_ID')
    }

    if (!validMatricNo(matric_no)) {
        return response(400, null, 'Invalid Student Matric', res, 'INVALID_STUDENT_MATRIC')
    }

    if(!validEmail(email)) {
        return response(400, null, 'Invalid email input', res, 'INVALID_EMAIL')
    }

    if(!validNoKp(no_kp)) {
        return response(400, null, 'Invalid No KP input', res, 'INVALID_NO_KP')
    }

    if (!validId(course_id)) {
        return response(400, null, 'Invalid Course Id', res, 'INVALID_COURSE_ID')
    }

    const checkCourses = 'SELECT 1 FROM courses WHERE course_id = ?'

    db.query(checkCourses, [course_id], (err, result) => {
        if (err) {
            console.error('err: ', err.message)
            return response(500, null, 'Server Error', res, 'SERVER_ERROR')
        }
        if (result.length === 0) {
            return response(404, null, 'Course Not Found', res, 'COURSE_NOT_FOUND')
        }

        const updateQuery = `
            UPDATE student SET
            matric_no = ?,
            no_kp = ?,
            email = ?,
            student_name = ?,
            address = ?,
            gender = ?,
            course_id = ?
            WHERE student_id = ?
        `

        const values = [
            matric_no,
            no_kp,
            email,
            student_name,
            address || null,
            gender || null,
            course_id,
            student_id
        ]

        db.query(updateQuery, values, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.error(`ERROR: ${err.message}`)
                    return response(409, null, 'Unable, Please check your information.', res, 'DUPLICATE_STUDENT')
                }
                console.error('error: ', err.message)
                return response(500, null, 'Server Error', res, 'SERVER_ERROR')
            }

            if(result.affectedRows === 0){
                return  response(404, null, 'Student not found', res, 'STUDENT_NOT_FOUND')
            }
            const dataResult = {
                dataRows: result.affectedRows,
                dataMessage: result.message
            }
            return response(200, dataResult, 'Student updated successfully', res)
        })
    })
})


app.put('/courses', (req, res) => {
    const {
        course_code,
        course_name,
        course_id
    } = req.body

    if ( !course_code || !course_name ) {
        return response(400, null, 'Required Error', res, 'REQUIRED_ERROR')
    }

    if (!validId(course_id)) {
        return response(400, null, 'Invalid Course Id', res, 'INVALID_COURSE_ID')
    }
    if (!validCourseCode(course_code)) {
        return response(400, null, 'Invalid Course Code', res, 'INVALID_COURSE_CODE')
    }

    const updateCourse = 'UPDATE courses SET course_code = ?, course_name = ? WHERE course_id = ?'

    const values = [
        course_code,
        course_name,
        course_id
    ]

    db.query(updateCourse, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return response(409, null, 'Duplicate Course Code', res, 'DUPLICATE_COURSE_CODE')
            }
            console.error('err: ', err.message)
            return response(500, null, 'Server Error', res, 'SERVER_ERROR')
            
        }
        if ( result.affectedRows === 0 ) {
            console.log('result 404', result)
            return response(404, null, 'Course Not Found', res, 'COURSE_NOT_FOUND')
        }
        console.log(result)
        return response(200, result, 'Updated OK', res)
    })
})


app.delete('/students/:studentId', (req, res) => {

    const student_id  = req.params.studentId

    if (!validId(student_id)) {
        return response(400, null, 'Invalid Student Id', res, 'INVALID_STUDENT_ID')
    }

    const deleteStudent = 'DELETE FROM student WHERE student_id = ?'

    db.query(deleteStudent, [student_id], (err, result) => {
        if(err) {
            console.error('err: ', err.message)
            return response(500, null, 'Server Error', res, 'SERVER_ERROR')
        }
        if(result.affectedRows === 0) {
            return response(404, null, 'Student Not Found', res, 'STUDENT_NOT_FOUND')
        }
        return response(200, result, 'delete succcess', res)
    })
})

app.delete('/courses/:courseId', (req, res) => {
    const course_Id = req.params.courseId

    if (!validId(course_Id)) {
        return response(400, null, 'Invalid Course Id', res, 'INVALID_COURSE_ID')
    }

    const deleteCourse = 'DELETE FROM courses WHERE course_id = ? '
    db.query(deleteCourse, [course_Id], (err, result) => {
        if ( err ){
            console.error('err:', err.message)
            return response(500, null, 'Server Error', res, 'SERVER_ERROR')
        }
        if (result.affectedRows === 0) {
            return response(404, null, 'Course Not Found', res, 'COURSE_NOT_FOUND')
        }
        response(200, result, 'Delete OK', res)
    })
})

// app.use('/')
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})


