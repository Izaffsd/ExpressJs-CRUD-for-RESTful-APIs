// Reusable pagination utility
export const paginate = async (db, baseQuery, query = {}, params = []) => {
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10))
  const offset = (page - 1) * limit

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
      has_next: page < totalPages,
      has_prev: page > 1
    }
  }
}
