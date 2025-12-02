import { formatDate, formatTimeRange } from '../utils/formatters'

export default function PrintableSignupList({ event, signups }) {
  return (
    <div className="printable-signup-list">
      {/* School Header */}
      <div className="print-header">
        <h1 className="print-school-name">KELLENBERG MEMORIAL HIGH SCHOOL</h1>
        <h2 className="print-program-name">S.A.L.T. - Service Event Attendance</h2>
        <p className="print-tagline">Service • Allegiance • Leadership • Teamwork</p>
      </div>

      {/* Event Details */}
      <div className="print-event-details">
        <h3 className="print-event-title">{event.title}</h3>
        <div className="print-event-info">
          <p><strong>Date:</strong> {formatDate(event.start_date || event.date)}</p>
          {(event.start_date || event.date) && event.end_date && (
            <p><strong>Time:</strong> {formatTimeRange(event.start_date || event.date, event.end_date)}</p>
          )}
        </div>
        <p className="print-total-signups">
          <strong>Total Students:</strong> {signups.length}
        </p>
      </div>

      {/* Student List */}
      <div className="print-student-list">
        <table className="print-table">
          <tbody>
            {signups.map((signup, index) => (
              <tr key={signup.id || index}>
                <td className="print-checkbox-cell">☐</td>
                <td className="print-name-cell">
                  <div className="print-student-name">
                    {signup.students?.last_name}, {signup.students?.first_name}
                  </div>
                  <div className="print-student-email">
                    {signup.students?.email}
                  </div>
                </td>
                <td className="print-grade-cell">{signup.students?.grade || '-'}</td>
                <td className="print-homeroom-cell">{signup.students?.homeroom || '-'}</td>
                <td className="print-status-cell">{signup.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

