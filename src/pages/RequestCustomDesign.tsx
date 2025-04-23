// RequestCustomDesign.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, Upload, DollarSign, Cake, Users, Clock, MessageSquare, Info, Phone, Mail, User, Check } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { designProcess, serviceInfo } from '@/utils/data';
// Animation variants
const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};
type FormInputs = {
    name: string;
    email: string;
    phone: string;
    occasion: string;
    eventDate: string;
    servings: string;
    cakeType: string;
    flavors: string[];
    designDescription: string;
    budget: string;
    additionalRequests: string;
    referralSource: string;
};
const occasions = [
    "Wedding", "Birthday", "Anniversary", "Baby Shower",
    "Bridal Shower", "Graduation", "Corporate Event", "Other"
];
const cakeTypes = [
    "Tiered Cake", "Sheet Cake", "Cupcakes", "Cake Pops", "Dessert Table", "Other"
];
const flavorOptions = [
    "Vanilla", "Chocolate", "Red Velvet", "Lemon", "Strawberry",
    "Carrot", "Coconut", "Coffee", "Marble", "Funfetti"
];
const budgetRanges = [
    "Under $100", "$100 - $200", "$200 - $300", "$300 - $500", "$500+"
];
const RequestCustomDesign = () => {
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>();
    // Set up intersection observer hooks for animations
    const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const [processRef, processInView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const [formRef, formInView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const [formInfoRef, formInfoInView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const handleFlavorToggle = (flavor: string) => {
        setSelectedFlavors(prev =>
            prev.includes(flavor)
                ? prev.filter(f => f !== flavor)
                : [...prev, flavor]
        );
    };
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileArray = Array.from(e.target.files);
            setUploadedFiles(prev => [...prev, ...fileArray]);
        }
    };
    const removeFile = (indexToRemove: number) => {
        setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };
    const onSubmit: SubmitHandler<FormInputs> = (data) => {
        // Set loading state
        setIsSubmitting(true);
        
        // Here you'd normally send the data to your backend
        console.log({ ...data, flavors: selectedFlavors, files: uploadedFiles });
        
        // Simulate network request delay
        setTimeout(() => {
            // Show success message
            setIsSubmitting(false);
            setSubmitted(true);
            
            // Reset form after 5 seconds
            setTimeout(() => {
                setSubmitted(false);
                setSelectedFlavors([]);
                setUploadedFiles([]);
                reset();
            }, 5000);
        }, 1000);
    };
    return (
        <div className="">
            {/* Header Section */}
            <motion.section
                ref={headerRef}
                initial="hidden"
                animate={headerInView ? "visible" : "hidden"}
                variants={fadeIn}
                className="relative min-h-[50vh] flex items-center overflow-hidden"
                style={{
                    backgroundImage: "linear-gradient(to bottom, rgba(245, 221, 233, 0.8), rgba(255, 245, 238, 0.9)), url('/src/assets/images/hero-bg.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                    width: '100%',
                    marginTop: '0',
                    paddingTop: '6rem',
                    paddingBottom: '3rem'
                } as React.CSSProperties}
            >
                <div className="absolute inset-0 bg-gold-shimmer opacity-20"></div>
                <div className="container relative z-10 text-center">
                    <motion.p
                        className="font-script text-rosepink text-2xl md:text-3xl mb-3"
                        variants={fadeIn}
                    >
                        Customized Just For You
                    </motion.p>
                    <motion.h1
                        className="text-3xl md:text-5xl font-heading font-bold text-deepbrown mb-5"
                        variants={fadeIn}
                    >
                        Request a Custom Cake Design
                    </motion.h1>
                    <motion.p
                        className="text-lg md:text-xl text-warmgray-700 max-w-2xl mx-auto"
                        variants={fadeIn}
                    >
                        Tell us about your dream cake, and our talented pastry chefs will bring it to life for your special occasion.
                    </motion.p>
                </div>
            </motion.section>

            {/* Decorative Image Section - NEW */}
            <section className="py-12 bg-white">
                <div className="container max-w-6xl">
                    <div className="relative rounded-2xl overflow-hidden shadow-soft-pink border border-blush/20">
                        <div className="absolute inset-0 bg-gradient-to-r from-hotpink/40 to-transparent z-10"></div>
                        <img 
                            src="/src/assets/images/custom-cake-banner.jpg" 
                            alt="Custom cake creation process" 
                            className="w-full h-[400px] object-cover"
                        />
                        <div className="absolute top-1/2 left-12 transform -translate-y-1/2 z-20 max-w-md">
                            <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-lg">
                                <h3 className="text-2xl font-heading text-deepbrown mb-3">Your Dream, Our Expertise</h3>
                                <p className="text-warmgray-700">
                                    From sketch to slice, we bring your vision to life with precision and artistry. 
                                    Our custom cakes are designed to be the centerpiece of your celebration.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Design Process Section - Added */}
            <motion.section
                ref={processRef}
                initial="hidden"
                animate={processInView ? "visible" : "hidden"}
                variants={staggerContainer}
                className="section"
            >
                <div className="container max-w-5xl">
                    <motion.div className="text-center mb-12" variants={fadeIn}>
                        <p className="title-accent">How It Works</p>
                        <h2 className="text-3xl md:text-4xl font-heading text-deepbrown">Our Custom Design Process</h2>
                    </motion.div>
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-rosepink/50 to-transparent hidden md:block"></div>
                        
                        {designProcess.map((step, index) => (
                            <motion.div 
                                key={step.step}
                                className={`flex items-center mb-8 md:mb-12 relative ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                variants={fadeIn}
                            >
                                {/* Step Content */}
                                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                                    <div className="glass p-6 rounded-xl shadow-soft-pink border border-blush/20">
                                        <p className="font-script text-rosepink text-xl mb-1">Step {step.step}</p>
                                        <h3 className="text-xl font-heading text-deepbrown mb-2">{step.title}</h3>
                                        <p className="text-warmgray-600 text-sm">{step.description}</p>
                                    </div>
                                </div>
                                {/* Step Circle */}
                                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white rounded-full items-center justify-center border-2 border-rosepink shadow-md">
                                    <Check className="w-5 h-5 text-rosepink" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Form Section */}
            <motion.section
                ref={formRef}
                initial="hidden"
                animate={formInView ? "visible" : "hidden"}
                variants={staggerContainer}
                className="section bg-pink-gradient py-16"
            >
                <div className="container max-w-4xl">
                    {submitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass p-10 rounded-xl text-center shadow-soft-pink border border-blush/20"
                        >
                            <div className="w-24 h-24 bg-mint/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-hotpink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-heading text-deepbrown mb-4">Request Submitted Successfully!</h2>
                            <p className="text-lg text-warmgray-700 mb-8 max-w-xl mx-auto">
                                Thank you for your custom cake request. One of our talented pastry chefs will contact you within 24 hours to discuss your design and finalize the details.
                            </p>
                            <button
                                onClick={() => {
                                    setSubmitted(false);
                                    reset();
                                    setSelectedFlavors([]);
                                    setUploadedFiles([]);
                                }}
                                className="btn btn-secondary px-6 py-3"
                            >
                                Submit Another Request
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form
                            onSubmit={handleSubmit(onSubmit)}
                            className="glass p-8 md:p-10 rounded-xl shadow-soft-pink border border-blush/20"
                            variants={fadeIn}
                        >
                            <div className="mb-10">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-rosepink/20 rounded-full flex items-center justify-center mr-3">
                                        <User className="w-5 h-5 text-hotpink" />
                                    </div>
                                    <h2 className="text-2xl font-heading text-deepbrown">Contact Information</h2>
                                </div>
                                <div className="w-full h-1 bg-gradient-to-r from-rosepink/50 to-transparent rounded-full mb-8"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <motion.div variants={fadeIn}>
                                        <label htmlFor="name" className="form-label">Your Name <span className="text-hotpink">*</span></label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rosepink/50 w-5 h-5" />
                                            <input
                                                id="name"
                                                type="text"
                                                className={`form-input pl-10 ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-warmgray-200'}`}
                                                placeholder="Enter your full name"
                                                {...register("name", { required: "Please enter your name" })}
                                            />
                                        </div>
                                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                                    </motion.div>
                                    <motion.div variants={fadeIn}>
                                        <label htmlFor="email" className="form-label">Email Address <span className="text-hotpink">*</span></label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rosepink/50 w-5 h-5" />
                                            <input
                                                id="email"
                                                type="email"
                                                className={`form-input pl-10 ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-warmgray-200'}`}
                                                placeholder="your.email@example.com"
                                                {...register("email", {
                                                    required: "Please enter your email",
                                                    pattern: {
                                                        value: /^[A-Z0-9.%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: "Invalid email address"
                                                    }
                                                })}
                                            />
                                        </div>
                                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                                    </motion.div>
                                    <motion.div variants={fadeIn}>
                                        <label htmlFor="phone" className="form-label">Phone Number <span className="text-hotpink">*</span></label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rosepink/50 w-5 h-5" />
                                            <input
                                                id="phone"
                                                type="tel"
                                                className={`form-input pl-10 ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-warmgray-200'}`}
                                                placeholder="(123) 456-7890"
                                                {...register("phone", { required: "Please enter your phone number" })}
                                            />
                                        </div>
                                        {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
                                    </motion.div>
                                    <motion.div variants={fadeIn}>
                                        <label htmlFor="referralSource" className="form-label flex items-center">
                                            How did you hear about us?
                                            <div className="relative group ml-1">
                                                <Info className="w-4 h-4 text-rosepink/70" />
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white p-2 rounded-md shadow-md text-xs text-warmgray-700 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                    This helps us understand how customers find our bakery
                                                </div>
                                            </div>
                                        </label>
                                        <input
                                            id="referralSource"
                                            type="text"
                                            className="form-input border-warmgray-200"
                                            placeholder="Instagram, Friend, Google, etc."
                                            {...register("referralSource")}
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="mb-10">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-peachy/20 rounded-full flex items-center justify-center mr-3">
                                        <Calendar className="w-5 h-5 text-hotpink" />
                                    </div>
                                    <h2 className="text-2xl font-heading text-deepbrown">Event Details</h2>
                                </div>
                                <div className="w-full h-1 bg-gradient-to-r from-peachy/50 to-transparent rounded-full mb-8"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <motion.div variants={fadeIn}>
                                        <label htmlFor="occasion" className="form-label">Occasion <span className="text-hotpink">*</span></label>
                                        <select
                                            id="occasion"
                                            className={`form-select ${errors.occasion ? 'border-red-300 focus:border-red-500' : 'border-warmgray-200'}`}
                                            {...register("occasion", { required: "Please select an occasion" })}
                                        >
                                            <option value="">Select occasion</option>
                                            {occasions.map(occasion => (
                                                <option key={occasion} value={occasion}>{occasion}</option>
                                            ))}
                                        </select>
                                        {errors.occasion && <p className="text-sm text-red-500 mt-1">{errors.occasion.message}</p>}
                                    </motion.div>
                                    <motion.div variants={fadeIn}>
                                        <label htmlFor="eventDate" className="form-label">Event Date <span className="text-hotpink">*</span></label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rosepink/50 w-5 h-5" />
                                            <input
                                                id="eventDate"
                                                type="date"
                                                className={`form-input pl-10 ${errors.eventDate ? 'border-red-300 focus:border-red-500' : 'border-warmgray-200'}`}
                                                {...register("eventDate", { required: "Please select your event date" })}
                                            />
                                        </div>
                                        {errors.eventDate && <p className="text-sm text-red-500 mt-1">{errors.eventDate.message}</p>}
                                    </motion.div>
                                    <motion.div variants={fadeIn}>
                                        <label htmlFor="servings" className="form-label">Number of Servings <span className="text-hotpink">*</span></label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rosepink/50 w-5 h-5" />
                                            <input
                                                id="servings"
                                                type="text"
                                                className={`form-input pl-10 ${errors.servings ? 'border-red-300 focus:border-red-500' : 'border-warmgray-200'}`}
                                                placeholder="Approximate number of guests"
                                                {...register("servings", { required: "Please enter number of servings" })}
                                            />
                                        </div>
                                        {errors.servings && <p className="text-sm text-red-500 mt-1">{errors.servings.message}</p>}
                                    </motion.div>
                                    <motion.div variants={fadeIn}>
                                        <label htmlFor="cakeType" className="form-label">Type of Cake <span className="text-hotpink">*</span></label>
                                        <div className="relative">
                                            <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rosepink/50 w-5 h-5" />
                                            <select
                                                id="cakeType"
                                                className={`form-select pl-10 ${errors.cakeType ? 'border-red-300 focus:border-red-500' : 'border-warmgray-200'}`}
                                                {...register("cakeType", { required: "Please select a cake type" })}
                                            >
                                                <option value="">Select cake type</option>
                                                {cakeTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.cakeType && <p className="text-sm text-red-500 mt-1">{errors.cakeType.message}</p>}
                                    </motion.div>
                                </div>
                            </div>

                            <div className="mb-10">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-mint/20 rounded-full flex items-center justify-center mr-3">
                                        <Cake className="w-5 h-5 text-hotpink" />
                                    </div>
                                    <h2 className="text-2xl font-heading text-deepbrown">Design Preferences</h2>
                                </div>
                                <div className="w-full h-1 bg-gradient-to-r from-mint/50 to-transparent rounded-full mb-8"></div>
                                
                                <motion.div className="mb-8" variants={fadeIn}>
                                    <label className="form-label mb-3">Preferred Flavors (select all that apply)</label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {flavorOptions.map(flavor => (
                                            <label
                                                key={flavor}
                                                className={`flavor-checkbox transition duration-200 hover:shadow-md ${selectedFlavors.includes(flavor) ? 'bg-rosepink/20 border-rosepink shadow-sm' : 'bg-white/80 border-warmgray-200'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={selectedFlavors.includes(flavor)}
                                                    onChange={() => handleFlavorToggle(flavor)}
                                                />
                                                <span>{flavor}</span>
                                            </label>
                                        ))}
                                    </div>
                                </motion.div>
                                
                                <motion.div className="mb-8" variants={fadeIn}>
                                    <label htmlFor="designDescription" className="form-label">Design Description <span className="text-hotpink">*</span></label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-3 text-rosepink/50 w-5 h-5" />
                                        <textarea
                                            id="designDescription"
                                            rows={5 as const}
                                            className={`form-textarea pl-10 ${errors.designDescription ? 'border-red-300 focus:border-red-500' : 'border-warmgray-200'}`}
                                            placeholder="Please describe your dream cake in detail: colors, theme, decorations, any specific elements you'd like to include..."
                                            {...register("designDescription", { required: "Please describe your cake design" })}
                                        ></textarea>
                                    </div>
                                    {errors.designDescription && <p className="text-sm text-red-500 mt-1">{errors.designDescription.message}</p>}
                                </motion.div>
                                
                                <motion.div className="mb-8" variants={fadeIn}>
                                    <label htmlFor="fileUpload" className="form-label">Design Inspiration Images (optional)</label>
                                    <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-warmgray-200 rounded-md hover:border-rosepink/50 hover:bg-white/50 transition-colors duration-200 bg-white/30">
                                        <div className="space-y-2 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-warmgray-400" />
                                            <div className="flex text-sm text-warmgray-600">
                                                <label htmlFor="fileUpload" className="relative cursor-pointer rounded-md font-medium text-rosepink hover:text-hotpink">
                                                    <span>Upload files</span>
                                                    <input
                                                        id="fileUpload"
                                                        name="fileUpload"
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={handleFileUpload}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-warmgray-500">PNG, JPG, GIF up to 10MB each</p>
                                        </div>
                                    </div>
                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="relative group">
                                                    <div className="aspect-square rounded-md overflow-hidden border border-warmgray-200 shadow-sm bg-white">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`Upload ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="absolute -top-2 -right-2 bg-white w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:bg-red-50 border border-warmgray-200"
                                                    >
                                                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                    <p className="text-xs text-warmgray-500 text-center mt-1 truncate">
                                                        {file.name}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                                
                                <motion.div className="mb-8" variants={fadeIn}>
                                    <label htmlFor="budget" className="form-label">Budget Range <span className="text-hotpink">*</span></label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rosepink/50 w-5 h-5" />
                                        <select
                                            id="budget"
                                            className={`form-select pl-10 ${errors.budget ? 'border-red-300 focus:border-red-500' : 'border-warmgray-200'}`}
                                            {...register("budget", { required: "Please select a budget range" })}
                                        >
                                            <option value="">Select budget range</option>
                                            {budgetRanges.map(range => (
                                                <option key={range} value={range}>{range}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.budget && <p className="text-sm text-red-500 mt-1">{errors.budget.message}</p>}
                                </motion.div>
                                
                                <motion.div variants={fadeIn}>
                                    <label htmlFor="additionalRequests" className="form-label">Additional Requests or Comments</label>
                                    <textarea
                                        id="additionalRequests"
                                        rows={3 as const}
                                        className="form-textarea border-warmgray-200"
                                        placeholder="Any dietary restrictions, special requests, or additional information..."
                                        {...register("additionalRequests")}
                                    ></textarea>
                                </motion.div>
                            </div>
                            
                            <motion.div
                                className="flex flex-col items-center"
                                variants={fadeIn}
                            >
                                <p className="text-sm text-warmgray-600 mb-4 text-center">
                                    By submitting this form, you agree to be contacted by our team to discuss your custom cake order.
                                </p>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary px-8 py-3 text-lg relative overflow-hidden"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-pulse">Submitting...</span>
                                            <span className="absolute inset-0 bg-white/20 animate-width"></span>
                                        </>
                                    ) : (
                                        "Submit Cake Request"
                                    )}
                                </button>
                            </motion.div>
                        </motion.form>
                    )}
                    
                    <motion.div
                        ref={formInfoRef}
                        initial="hidden"
                        animate={formInfoInView ? "visible" : "hidden"}
                        variants={fadeIn}
                        className="mt-12 glass p-8 rounded-xl shadow-soft-pink border border-blush/20"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-shrink-0 w-20 h-20 bg-blush/30 rounded-full flex items-center justify-center">
                                <Clock className="w-9 h-9 text-deepbrown" />
                            </div>
                            <div>
                                <h3 className="text-xl font-heading text-deepbrown mb-2">Order Information</h3>
                                <p className="text-warmgray-600 mb-2">
                                    Order Lead Time: <span className="font-medium">{serviceInfo.orderLeadTime}.</span>
                                </p>
                                <p className="text-warmgray-600 mb-2">
                                    For complex designs or wedding cakes, we recommend placing your order <span className="font-medium">3-4 weeks</span> in advance.
                                </p>
                                <p className="text-warmgray-600 mb-2">
                                    A deposit of <span className="font-medium">{serviceInfo.depositAmount}</span> is required to secure your date.
                                </p>
                                <p className="text-sm text-warmgray-500 italic">
                                    Our team will review your request and contact you within 24 hours to discuss details and provide a quote.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
};
export default RequestCustomDesign;