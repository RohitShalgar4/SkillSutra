// features/api/certificateApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CERTIFICATE_API = "https://skillsutra.onrender.com/api/v1/certificates/";

export const certificateApi = createApi({
    reducerPath: "certificateApi",
    baseQuery: fetchBaseQuery({
        baseUrl: CERTIFICATE_API,
        credentials: "include",
        prepareHeaders: (headers) => {
            headers.set('Accept', 'application/pdf');
            return headers;
        },
    }),
    endpoints: (builder) => ({
        generateCertificate: builder.mutation({
            query: (courseId) => ({
                url: `${courseId}/generate`,
                method: "POST",
                responseHandler: async (response) => response.blob(),
            }),
        }),
    }),
});

export const { useGenerateCertificateMutation } = certificateApi;