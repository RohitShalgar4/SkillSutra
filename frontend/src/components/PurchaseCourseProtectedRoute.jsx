import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const PurchaseCourseProtectedRoute = ({children}) => {
    const {courseId} = useParams();
    const [retryCount, setRetryCount] = useState(0);
    const [hasCheckedStatus, setHasCheckedStatus] = useState(false);
    const {data, isLoading, isError, refetch} = useGetCourseDetailWithStatusQuery(courseId);

    // Retry mechanism for webhook delays
    useEffect(() => {
        if (isError || (!isLoading && !data?.purchased && retryCount < 3)) {
            const timer = setTimeout(() => {
                setRetryCount(prev => prev + 1);
                refetch();
            }, 2000); // Wait 2 seconds before retrying

            return () => clearTimeout(timer);
        }
    }, [isError, isLoading, data?.purchased, retryCount, refetch]);

    // Fallback mechanism to check purchase status directly
    useEffect(() => {
        if (retryCount >= 3 && !data?.purchased && !hasCheckedStatus) {
            setHasCheckedStatus(true);
            
            // Call the check-status endpoint
            fetch(`https://skillsutra.onrender.com/api/v1/purchase/course/${courseId}/check-status`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    // If status was updated, refetch the purchase status
                    setTimeout(() => refetch(), 1000);
                }
            })
            .catch(error => {
                console.error('Error checking purchase status:', error);
            });
        }
    }, [retryCount, data?.purchased, hasCheckedStatus, courseId, refetch]);

    if(isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg">Verifying your purchase...</p>
                {retryCount > 0 && (
                    <p className="text-sm text-gray-500 mt-2">Attempt {retryCount}/3</p>
                )}
            </div>
        </div>
    )
    
    // If we've tried 3 times and still no purchase, redirect to course detail
    if (retryCount >= 3 && !data?.purchased && hasCheckedStatus) {
        return <Navigate to={`/course-detail/${courseId}`}/>;
    }

    return data?.purchased ? children : <Navigate to={`/course-detail/${courseId}`}/>
}

PurchaseCourseProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired
};

export default PurchaseCourseProtectedRoute;