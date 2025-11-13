import React from 'react';

interface StudentCardProps {
    name: string;
    age: number;
    grade: string;
    busRoute: string;
}

const StudentCard: React.FC<StudentCardProps> = ({ name, age, grade, busRoute }) => {
    return (
        <div className="student-card">
            <h2>{name}</h2>
            <p>Age: {age}</p>
            <p>Grade: {grade}</p>
            <p>Bus Route: {busRoute}</p>
        </div>
    );
};

export default StudentCard;