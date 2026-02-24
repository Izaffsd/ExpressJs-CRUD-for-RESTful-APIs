// Reusable pagination utility
// baseQuery = 'SELECT * FROM students WHERE course_id = ?' (without LIMIT/OFFSET)
// req.query = /students?page=2&limit=5
// params = For prepared statement values. = [courseId]
export const paginate = async (db, baseQuery, query = {}, params = []) => {

  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10))
  const offset = (page - 1) * limit // skip first total rows 
  // example request ?page=2&limit=5, so offset = (2 - 1) × 5 = 5.


  // Count total rows (wrap the base query)
  const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as countTable`
  const [countResult] = await db.query(countQuery, params)
  const total = countResult[0].total

  // Fetch paginated data
  const [data] = await db.query(`${baseQuery} LIMIT ? OFFSET ?`, [...params, limit, offset])

  const totalPages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
      has_next: page < totalPages, // status
      has_prev: page > 1
    }
  }
}
