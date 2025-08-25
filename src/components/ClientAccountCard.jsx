import React from 'react';
import { Card } from "./ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/Badge";
import { MapPin, Mail, Phone, Calendar, Globe, Twitter, Linkedin, Eye, Edit2, Trash2 } from "lucide-react";
import { fmtCurrency } from "../utils/helpers"; // Assuming fmtCurrency is available

// Placeholder for translations, similar to ClientCard
const cardTranslations = {
  ar: {
    noName: "اسم غير متوفر",
    noIndustry: "—",
    noBio: "لا توجد نبذة",
    projects: "المشاريع",
    totalValue: "إجمالي القيمة",
    currency: "جنيه",
    joinDateNotAvailable: "تاريخ الانضمام غير متوفر",
    joinedOn: "انضم في",
    noNotes: "لا توجد ملاحظات"
  },
  en: {
    noName: "No Name",
    noIndustry: "—",
    noBio: "No bio available",
    projects: "Projects",
    totalValue: "Total Value",
    currency: "EGP",
    joinDateNotAvailable: "Join date not available",
    joinedOn: "Joined on",
    noNotes: "No notes"
  }
};

const ClientAccountCard = ({ 
  account, // Renamed from 'client' to 'account' for clarity
  onView, 
  onEdit, 
  onDelete, 
  accountProjects = {}, // Renamed from 'clientProjects'
  getTotalProjectsValue,
  language = 'ar',
  currency = 'EGP'
}) => {
  const t = cardTranslations[language];
  const fullName = `${account.prefix || ""} ${account.first_name || ""} ${account.last_name || ""}`.trim();
  const initials = `${account.first_name?.[0] || ""}${account.last_name?.[0] || ""}`.toUpperCase();

  const formatJoinDate = (dateString) => {
    if (!dateString) return t.joinDateNotAvailable;
    const date = new Date(dateString);
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return `${t.joinedOn} ${date.toLocaleDateString(locale, options)}`;
  };

  return (
    <Card className={`w-full overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl leading-4 py-0 group ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header with gradient background */}
      <div className="relative h-28 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-400">
        {/* Cover Image */}
        {account.cover_image_url && (
          <img 
            src={account.cover_image_url} 
            alt="صورة الغلاف" 
            className="w-full h-full object-cover opacity-80"
          />
        )}
        
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/80 via-emerald-500/80 to-teal-400/80"></div>

        {/* Profile Avatar positioned to overlap header */}
        <div className={`absolute -bottom-10 ${language === 'ar' ? 'left-6' : 'right-6'} transform`}>
          <Avatar className="w-20 h-20 border-white shadow-md border-2">
            <AvatarImage
              src={account.profile_image_url || account.picture_url}
              alt={fullName}
              className="object-cover"
            />
            <AvatarFallback className="bg-gray-200 text-gray-700 text-base font-semibold">
              {initials || "AC"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Card Content */}
      <div className="pt-12 pb-5 px-6">
        {/* Name and Type */}
        <div className={`text-${language === 'ar' ? 'right' : 'left'} mb-3`}>
          <h3 className="text-lg font-bold text-gray-800 mb-0.5">{fullName || t.noName}</h3>
          {account.account_type && <p className="text-xs text-gray-600 font-medium">{account.account_type}</p>}
        </div>

        {/* Projects Summary */}
        {accountProjects[account.id]?.length > 0 && (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg">
            <div className={`flex items-center gap-2 text-xs text-blue-700 mb-0.5 justify-${language === 'ar' ? 'end' : 'start'}`}>
              <span>{t.projects}: {accountProjects[account.id].length}</span>
            </div>
            <div className={`text-xs text-blue-600 text-${language === 'ar' ? 'right' : 'left'}`}>
              {t.totalValue}: {getTotalProjectsValue ? fmtCurrency(getTotalProjectsValue(account.id), currency) : fmtCurrency(0, currency)}
            </div>
          </div>
        )}

        {/* Contact Information (simplified) */}
        <div className="space-y-1 mb-3">
          {account.email_address && (
            <div className={`flex items-center gap-1 text-xs text-gray-600 justify-${language === 'ar' ? 'end' : 'start'}`}>
              <span className="truncate">{account.email_address}</span>
              <Mail className="w-3 h-3" />
            </div>
          )}
          {account.phone_number && (
            <div className={`flex items-center gap-1 text-xs text-gray-600 justify-${language === 'ar' ? 'end' : 'start'}`}>
              <span>{account.phone_number}</span>
              <Phone className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Location & Join Date */}
        <div className="flex flex-col gap-1 mb-3">
          {account.location && (
            <div className={`flex items-center gap-1 text-xs text-gray-500 justify-${language === 'ar' ? 'end' : 'start'}`}>
              <MapPin className="w-3 h-3" />
              <span>{account.location}</span>
            </div>
          )}
          <div className={`flex items-center gap-1 text-xs text-gray-500 justify-${language === 'ar' ? 'end' : 'start'}`}>
            <Calendar className="w-3 h-3" />
            <span>{formatJoinDate(account.joined_date)}</span>
          </div>
        </div>

        {/* Notes Badge (if exists) */}
        {account.notes && (
          <div className={`mt-2 text-${language === 'ar' ? 'right' : 'left'}`}>
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
              {account.notes}
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
          {onView && (
            <button 
              onClick={() => onView(account)}
              className="p-1.5 rounded-full hover:bg-blue-50 transition-colors text-blue-600"
              title={language === 'ar' ? 'عرض' : 'View'}
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button 
              onClick={() => onEdit(account)}
              className="p-1.5 rounded-full hover:bg-indigo-50 transition-colors text-indigo-600"
              title={language === 'ar' ? 'تعديل' : 'Edit'}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(account.id)}
              className="p-1.5 rounded-full hover:bg-red-50 transition-colors text-red-600"
              title={language === 'ar' ? 'حذف' : 'Delete'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ClientAccountCard;
