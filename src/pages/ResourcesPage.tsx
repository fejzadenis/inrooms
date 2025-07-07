import React, { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { 
  Search, 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  ChevronDown, 
  ChevronUp,
  Users,
  CreditCard,
  Calendar,
  Rocket,
  Zap,
  Shield,
  Settings,
  Star,
  Building,
  Award,
  Clock,
  Code
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const categories = [
    { id: 'general', name: 'General', icon: HelpCircle, color: 'bg-blue-500' },
    { id: 'founder', name: 'Founder Basics', icon: Users, color: 'bg-green-500' },
    { id: 'funding', name: 'Funding', icon: CreditCard, color: 'bg-purple-500' },
    { id: 'rooms', name: 'Rooms', icon: Calendar, color: 'bg-orange-500' },
    { id: 'showcase', name: 'Showcase', icon: Rocket, color: 'bg-red-500' },
    { id: 'community', name: 'Community', icon: Award, color: 'bg-yellow-500' }
  ];

  const faqs: FAQItem[] = [
    /mmo   A(l ybudQslerpumydeto:' e S gpl    ;

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      </* Hd6poecrsebrofra=oJqXcor to-sf-3=pole= = }
     mhaildLayout>
  );
}