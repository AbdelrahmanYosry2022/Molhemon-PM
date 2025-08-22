import React from 'react';
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { MapPin, Mail, Phone, Calendar, Globe, Twitter, Linkedin, Eye, Edit2, Trash2 } from "lucide-react";
import { fmtCurrency } from "../utils/helpers";

// نظام الترجمة للكارد
const cardTranslations = {
  ar: {
    noName: "بدون اسم",
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

const ClientCard = ({ 
  client, 
  onView, 
  onEdit, 
  onDelete, 
  clientProjects = {}, 
  getTotalProjectsValue,
  language = 'ar',
  currency = 'EGP'
}) => {
  const t = cardTranslations[language];
  const fullName = `${client.prefix || ""} ${client.first_name || ""} ${client.last_name || ""}`.trim();
  const initials = `${client.first_name?.[0] || ""}${client.last_name?.[0] || ""}`.toUpperCase();

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
    <Card className={`w-full overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 leading-4 py-0 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header with gradient background */}
      <div className="relative h-32 bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400">
        {/* Cover Image */}
        {client.cover_image_url && (
          <img 
            src={client.cover_image_url} 
            alt="صورة الغلاف" 
            className="w-full h-full object-cover opacity-80"
          />
        )}
        
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/80 via-blue-500/80 to-cyan-400/80"></div>

        {/* Profile Avatar positioned to overlap header */}
        <div className={`absolute -bottom-12 ${language === 'ar' ? 'left-6' : 'right-6'} transform`}>
          <Avatar className="w-24 h-24 border-white shadow-lg border-2">
            <AvatarImage
              src={client.profile_image_url || client.picture_url}
              alt={fullName}
              className="object-cover"
            />
            <AvatarFallback className="bg-gray-200 text-gray-700 text-lg font-semibold">
              {initials || "CL"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Card Content */}
      <div className="pt-16 pb-6 px-6">
        {/* Name and Title */}
        <div className={`text-${language === 'ar' ? 'right' : 'left'} mb-4`}>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{fullName || t.noName}</h3>
          {client.industry && <p className="text-sm text-gray-600 font-medium">{client.industry}</p>}
        </div>

        {/* Location */}
        {client.location && (
          <div className={`flex items-center gap-1 mb-4 text-gray-600 justify-${language === 'ar' ? 'end' : 'start'}`}>
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{client.location}</span>
          </div>
        )}

        {/* Bio */}
        {client.client_bio && (
          <p className={`text-sm text-gray-700 leading-relaxed mb-4 line-clamp-4 text-${language === 'ar' ? 'right' : 'left'}`}>{client.client_bio}</p>
        )}

        {/* Projects Summary */}
        {clientProjects[client.id]?.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className={`flex items-center gap-2 text-sm text-blue-700 mb-1 justify-${language === 'ar' ? 'end' : 'start'}`}>
              <span>{t.projects}: {clientProjects[client.id].length}</span>
            </div>
            <div className={`text-xs text-blue-600 text-${language === 'ar' ? 'right' : 'left'}`}>
              {t.totalValue}: {getTotalProjectsValue ? fmtCurrency(getTotalProjectsValue(client.id), currency) : fmtCurrency(0, currency)}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          {client.email_address && (
            <div className={`flex items-center gap-2 text-sm text-gray-600 justify-${language === 'ar' ? 'end' : 'start'}`}>
              <span className="truncate">{client.email_address}</span>
              <Mail className="w-4 h-4" />
            </div>
          )}
          {client.phone_number && (
            <div className={`flex items-center gap-2 text-sm text-gray-600 justify-${language === 'ar' ? 'end' : 'start'}`}>
              <span>{client.phone_number}</span>
              <Phone className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Join Date and Actions */}
        <div className={`flex items-center justify-between pt-4 border-t border-gray-100 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{formatJoinDate(client.joined_date)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onView && (
              <button 
                onClick={() => onView(client)}
                className="p-1.5 rounded-full hover:bg-blue-100 transition-colors text-blue-600"
                title={language === 'ar' ? 'عرض' : 'View'}
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button 
                onClick={() => onEdit(client)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                title={language === 'ar' ? 'تعديل' : 'Edit'}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(client.id)}
                className="p-1.5 rounded-full hover:bg-red-100 transition-colors text-red-600"
                title={language === 'ar' ? 'حذف' : 'Delete'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Notes Badge (if exists) */}
        {client.notes && (
          <div className={`mt-3 text-${language === 'ar' ? 'right' : 'left'}`}>
            <Badge variant="secondary" className="text-xs">
              {client.notes}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ClientCard;
