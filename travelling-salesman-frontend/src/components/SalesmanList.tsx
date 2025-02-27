import React from 'react';

interface Salesman {
    salesman_id: string;
    home_location: [number, number];
    start_time: string;
    end_time: string;
}

interface SalesmanListProps {
    salesmen: Salesman[];
}

const SalesmanList: React.FC<SalesmanListProps> = ({ salesmen }) => {
    return (
        <div>
            <h2>Salesmen List</h2>
            {salesmen.length === 0 ? (
                <p>No salesmen available.</p>
            ) : (
                <ul>
                    {salesmen.map((salesman) => (
                        <li key={salesman.salesman_id}>
                            <strong>ID:</strong> {salesman.salesman_id} <br />
                            <strong>Home Location:</strong> {salesman.home_location.join(', ')} <br />
                            <strong>Available From:</strong> {salesman.start_time} <br />
                            <strong>Available Until:</strong> {salesman.end_time}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SalesmanList;