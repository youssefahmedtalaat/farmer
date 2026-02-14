import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Mail, MapPin, Phone, MessageCircle, Send, Search, Filter, CheckCircle2, Clock, XCircle, Eye, Reply, Trash2, Inbox, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../utils/language';
import { useAuth } from '../utils/auth';
import { DashboardLayout } from '../components/DashboardLayout';

interface ContactInquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'resolved';
  createdAt: string;
  repliedAt?: string;
}

export function Contact() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Mock data for admin view
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Farmer',
      email: 'john@farm.com',
      subject: 'How can we help you?',
      message: 'I need help with setting up my farm profile and adding crops to the system.',
      status: 'new',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'sarah@farm.com',
      subject: 'Subscription Question',
      message: 'I want to upgrade my subscription plan. Can you help me with the process?',
      status: 'read',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@farm.com',
      subject: 'Technical Support',
      message: 'I am experiencing issues with the crop tracking feature. The data is not syncing properly.',
      status: 'replied',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      repliedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily@farm.com',
      subject: 'Feature Request',
      message: 'It would be great to have a mobile app for the platform. Is this in development?',
      status: 'resolved',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      repliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'resolved'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    read: inquiries.filter(i => i.status === 'read').length,
    replied: inquiries.filter(i => i.status === 'replied').length,
    resolved: inquiries.filter(i => i.status === 'resolved').length,
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Clock className="w-3 h-3 mr-1" />{t('contact.admin.new')}</Badge>;
      case 'read':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Eye className="w-3 h-3 mr-1" />{t('contact.admin.read')}</Badge>;
      case 'replied':
        return <Badge className="bg-purple-500 hover:bg-purple-600"><Reply className="w-3 h-3 mr-1" />{t('contact.admin.replied')}</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />{t('contact.admin.resolved')}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return t('contact.admin.justNow');
    if (diffMins < 60) {
      return diffMins === 1 
        ? t('contact.admin.minuteAgo').replace('{count}', diffMins.toString())
        : t('contact.admin.minutesAgo').replace('{count}', diffMins.toString());
    }
    if (diffHours < 24) {
      return diffHours === 1
        ? t('contact.admin.hourAgo').replace('{count}', diffHours.toString())
        : t('contact.admin.hoursAgo').replace('{count}', diffHours.toString());
    }
    if (diffDays < 7) {
      return diffDays === 1
        ? t('contact.admin.dayAgo').replace('{count}', diffDays.toString())
        : t('contact.admin.daysAgo').replace('{count}', diffDays.toString());
    }
    return date.toLocaleDateString();
  };
  
  const handleStatusChange = (inquiryId: string, newStatus: ContactInquiry['status']) => {
    setInquiries(inquiries.map(inq => 
      inq.id === inquiryId 
        ? { ...inq, status: newStatus, repliedAt: newStatus === 'replied' ? new Date().toISOString() : inq.repliedAt }
        : inq
    ));
    if (selectedInquiry?.id === inquiryId) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }
  };
  
  const handleDelete = (inquiryId: string) => {
    setInquiries(inquiries.filter(inq => inq.id !== inquiryId));
    if (selectedInquiry?.id === inquiryId) {
      setSelectedInquiry(null);
    }
  };
  
  // If admin, show admin interface
  if (isAdmin) {
    return (
      <DashboardLayout hideSidebar={true}>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-[#2D6A4F] mb-2">{t('contact.admin.title')}</h1>
            <p className="text-gray-600">{t('contact.admin.subtitle')}</p>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('contact.admin.total')}</p>
                  <p className="text-2xl font-bold text-[#2D6A4F]">{stats.total}</p>
                </div>
                <Inbox className="w-8 h-8 text-[#2D6A4F]" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('contact.admin.new')}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('contact.admin.read')}</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.read}</p>
                </div>
                <Eye className="w-8 h-8 text-yellow-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('contact.admin.replied')}</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.replied}</p>
                </div>
                <Reply className="w-8 h-8 text-purple-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('contact.admin.resolved')}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </Card>
          </div>
          
          {/* Filters and Search */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder={t('contact.admin.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90"
                >
                  {t('contact.admin.all')}
                </Button>
                <Button
                  variant={statusFilter === 'new' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('new')}
                >
                  {t('contact.admin.new')}
                </Button>
                <Button
                  variant={statusFilter === 'read' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('read')}
                >
                  {t('contact.admin.read')}
                </Button>
                <Button
                  variant={statusFilter === 'replied' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('replied')}
                >
                  {t('contact.admin.replied')}
                </Button>
                <Button
                  variant={statusFilter === 'resolved' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('resolved')}
                >
                  {t('contact.admin.resolved')}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Inquiries List */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Inquiries List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredInquiries.length === 0 ? (
                <Card className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t('contact.admin.noInquiries')}</p>
                </Card>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <Card
                    key={inquiry.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedInquiry?.id === inquiry.id ? 'ring-2 ring-[#2D6A4F]' : ''
                    }`}
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {inquiry.firstName} {inquiry.lastName}
                          </h3>
                          {getStatusBadge(inquiry.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{inquiry.email}</p>
                        <p className="font-medium text-gray-900">{inquiry.subject}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{inquiry.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(inquiry.createdAt)}</span>
                      {inquiry.status === 'new' && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white">{t('contact.admin.unread')}</Badge>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
            
            {/* Inquiry Details */}
            <div className="lg:col-span-1">
              {selectedInquiry ? (
                <Card className="p-6 sticky top-4">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#2D6A4F]">{t('contact.admin.inquiryDetails')}</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedInquiry(null)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-600">{t('contact.admin.name')}</Label>
                      <p className="font-semibold">{selectedInquiry.firstName} {selectedInquiry.lastName}</p>
                    </div>
                    
                    <div>
                      <Label className="text-gray-600">{t('contact.admin.email')}</Label>
                      <a href={`mailto:${selectedInquiry.email}`} className="text-[#2D6A4F] hover:underline">
                        {selectedInquiry.email}
                      </a>
                    </div>
                    
                    <div>
                      <Label className="text-gray-600">{t('contact.admin.subject')}</Label>
                      <p className="font-semibold">{selectedInquiry.subject}</p>
                    </div>
                    
                    <div>
                      <Label className="text-gray-600">{t('contact.admin.message')}</Label>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                        {selectedInquiry.message}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-gray-600">{t('contact.admin.status')}</Label>
                      <div className="mt-1">{getStatusBadge(selectedInquiry.status)}</div>
                    </div>
                    
                    <div>
                      <Label className="text-gray-600">{t('contact.admin.submitted')}</Label>
                      <p className="text-sm">{formatDate(selectedInquiry.createdAt)}</p>
                    </div>
                    
                    {selectedInquiry.repliedAt && (
                      <div>
                        <Label className="text-gray-600">{t('contact.admin.repliedAt')}</Label>
                        <p className="text-sm">{formatDate(selectedInquiry.repliedAt)}</p>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t space-y-2">
                      <Button
                        className="w-full bg-[#2D6A4F] hover:bg-[#2D6A4F]/90"
                        onClick={() => window.location.href = `mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`}
                      >
                        <Reply className="w-4 h-4 mr-2" />
                        {t('contact.admin.replyViaEmail')}
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {selectedInquiry.status !== 'read' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(selectedInquiry.id, 'read')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {t('contact.admin.markRead')}
                          </Button>
                        )}
                        {selectedInquiry.status !== 'replied' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(selectedInquiry.id, 'replied')}
                          >
                            <Reply className="w-4 h-4 mr-1" />
                            {t('contact.admin.markReplied')}
                          </Button>
                        )}
                        {selectedInquiry.status !== 'resolved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(selectedInquiry.id, 'resolved')}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            {t('contact.admin.resolve')}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(selectedInquiry.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {t('contact.admin.delete')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t('contact.admin.selectInquiry')}</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Regular farmer contact form
  
  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[#2D6A4F] mb-4">{t('contact.title')}</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-[#2D6A4F] mb-6">{t('contact.form.title')}</h2>
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">{t('contact.form.firstName')}</Label>
                    <Input id="firstName" placeholder={t('contact.form.firstNamePlaceholder')} className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t('contact.form.lastName')}</Label>
                    <Input id="lastName" placeholder={t('contact.form.lastNamePlaceholder')} className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">{t('contact.form.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('contact.form.emailPlaceholder')}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">{t('contact.form.subject')}</Label>
                  <Input
                    id="subject"
                    placeholder={t('contact.form.subjectPlaceholder')}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="message">{t('contact.form.message')}</Label>
                  <Textarea
                    id="message"
                    placeholder={t('contact.form.messagePlaceholder')}
                    rows={6}
                    className="mt-2"
                  />
                </div>

                <Button className="w-full sm:w-auto bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full px-8">
                  <Send className="w-4 h-4 mr-2" />
                  {t('contact.form.sendButton')}
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="p-6">
              <h3 className="text-[#2D6A4F] mb-4">{t('contact.info.title')}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#2D6A4F]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#2D6A4F]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('contact.info.email')}</p>
                    <a
                      href="mailto:support@farmerassistant.com"
                      className="text-gray-900 hover:text-[#2D6A4F]"
                    >
                      support@farmerassistant.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#2D6A4F]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#2D6A4F]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('contact.info.phone')}</p>
                    <a href="tel:+1234567890" className="text-gray-900 hover:text-[#2D6A4F]">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#2D6A4F]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#2D6A4F]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('contact.info.address')}</p>
                    <p className="text-gray-900">
                      {t('contact.info.addressLine1')}
                      <br />
                      {t('contact.info.addressLine2')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Office Hours */}
            <Card className="p-6">
              <h3 className="text-[#2D6A4F] mb-4">{t('contact.hours.title')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('contact.hours.mondayFriday')}</span>
                  <span className="text-gray-900">{t('contact.hours.mondayFridayTime')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('contact.hours.saturday')}</span>
                  <span className="text-gray-900">{t('contact.hours.saturdayTime')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('contact.hours.sunday')}</span>
                  <span className="text-gray-900">{t('contact.hours.sundayTime')}</span>
                </div>
              </div>
            </Card>

            {/* FarmBot CTA */}
            <Card className="p-6 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] text-white">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-8 h-8" />
                <h3>{t('contact.farmbot.title')}</h3>
              </div>
              <p className="text-white/90 text-sm mb-4">
                {t('contact.farmbot.description')}
              </p>
              <Button className="w-full bg-white text-[#2D6A4F] hover:bg-white/90 rounded-full">
                {t('contact.farmbot.button')}
              </Button>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <Card className="p-8">
            <h2 className="text-[#2D6A4F] mb-6">{t('contact.location.title')}</h2>
            <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2D6A4F]/5 to-[#95D5B2]/5" />
              <div className="relative text-center">
                <MapPin className="w-16 h-16 text-[#2D6A4F] mx-auto mb-4" />
                <p className="text-gray-800 mb-2">{t('contact.location.visit')}</p>
                <p className="text-gray-600">{t('contact.info.addressLine1')}, {t('contact.info.addressLine2')}</p>
                <Link to="/explore-farms">
                  <Button className="mt-4 bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full">
                    {t('contact.location.directions')}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* FAQ Links */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">{t('contact.faq.title')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/about">
              <Button variant="outline" className="rounded-full">
                {t('contact.faq.aboutUs')}
              </Button>
            </Link>
            <Link to="/subscription">
              <Button variant="outline" className="rounded-full">
                {t('contact.faq.pricing')}
              </Button>
            </Link>
            <Button variant="outline" className="rounded-full">
              {t('contact.faq.helpCenter')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
