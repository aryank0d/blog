import PropTypes from 'prop-types';
import '../styles/pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="pagination-container">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
            >
                <svg viewBox="0 0 24 24" className="pagination-arrow">
                    <path d="M15 19l-7-7 7-7" />
                </svg>
                Previous
            </button>

            <span className="pagination-info">
                Page {currentPage} of {totalPages}
            </span>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
            >
                Next
                <svg viewBox="0 0 24 24" className="pagination-arrow">
                    <path d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
