import React from 'react';
import { Card } from "./Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "./Badge";
import { MapPin, Mail, Phone, Calendar, Globe, Twitter, Linkedin, Eye, Edit2, Trash2, Pencil } from "lucide-react";
import { ROLE_META, STATUS_META, RoleBadge, StatusBadge } from '../features/team/TeamPanel';

// Placeholder for translations
const cardTranslations = {
  ar: {
    noName: "اسم غير متوفر",
    noRole: "دور غير محدد",
    noStatus: "حالة غير محددة",
    joinedOn: "انضم في",
    joinDateNotAvailable: "تاريخ الانضمام غير متوفر",
    view: "عرض",
    edit: "تعديل",
    delete: "حذف",
    changeAvatar: "تغيير الصورة"
  },
  en: {
    noName: "No Name",
    noRole: "No Role",
    noStatus: "No Status",
    joinedOn: "Joined on",
    joinDateNotAvailable: "Join date not available",
    view: "View",
    edit: "Edit",
    delete: "Delete",
    changeAvatar: "Change Avatar"
  }
};

const TeamMemberCard = ({ 
  member, 
  onView, 
  onEdit, 
  onDelete, 
  onAvatarChange, // Callback for avatar change
  language = 'ar',
  viewMode = 'grid' // 'grid' or 'list'
}) => {
  const t = cardTranslations[language];
  const fullName = `${member.prefix || ""} ${member.first_name || member.name || ""} ${member.last_name || ""}`.trim();
  const initials = `${(member.first_name?.[0] || member.name?.[0]) || ""}${member.last_name?.[0] || ""}`.toUpperCase();

  const roleMeta = ROLE_META[member.role] || ROLE_META.member;
  const statusMeta = STATUS_META[member.status] || STATUS_META.active;

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

  // Render based on view mode
  if (viewMode === 'list') {
    return (
      <Card className="w-full bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-4 p-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={member.avatar_url || member.avatar}
                alt={fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-semibold">
                {initials || "TM"}
              </AvatarFallback>
            </Avatar>
            {onAvatarChange && (
              <>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 bg-white border border-gray-300 rounded-full p-1 shadow"
                  title={t.changeAvatar}
                  onClick={() => document.getElementById(`avatar-input-${member.id}`)?.click()}
                >
                  <Pencil size={10} />
                </button>
                <input
                  type="file"
                  id={`avatar-input-${member.id}`}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      onAvatarChange(member.id, file);
                    }
                  }}
                />
              </>
            )}
          </div>

          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{fullName || t.noName}</h3>
              {member.role && <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded border ${roleMeta.cls}`}>{roleMeta.label}</span>}
              {member.status && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${statusMeta.cls}`}>
                  <statusMeta.icon size={12} /> {statusMeta.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {member.email && <span className="truncate">{member.email}</span>}
              {member.phone && <span>{member.phone}</span>}
              <span>{formatJoinDate(member.joined)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onView && (
              <button 
                onClick={() => onView(member)}
                className="p-1.5 rounded hover:bg-blue-50 transition-colors text-blue-600"
                title={t.view}
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button 
                onClick={() => onEdit(member)}
                className="p-1.5 rounded hover:bg-gray-50 transition-colors text-gray-600"
                title={t.edit}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(member.id)}
                className="p-1.5 rounded hover:bg-red-50 transition-colors text-red-600"
                title={t.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className={`w-full overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 leading-4 py-0 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header with gradient background */}
      <div className="relative h-32 bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400">
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/80 via-blue-500/80 to-cyan-400/80"></div>

        {/* Profile Avatar positioned to overlap header */}
        <div className={`absolute -bottom-12 ${language === 'ar' ? 'left-6' : 'right-6'} transform`}>
          <div className="relative group">
            <Avatar className="w-24 h-24 border-white shadow-lg border-2">
              <AvatarImage
                src={
                  member.avatar_url && !member.avatar_url.startsWith('blob:') 
                    ? member.avatar_url 
                    : (member.avatar || "https://i.pravatar.cc/96?img=1")
                }
                alt={fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-200 text-gray-700 text-lg font-semibold">
                {initials || "TM"} {/* Initials for Team Member */}
              </AvatarFallback>
            </Avatar>
            {onAvatarChange && (
              <>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-1 shadow group-hover:scale-110 transition-all"
                  style={{ transform: 'translate(30%, 30%)' }}
                  title={t.changeAvatar}
                  onClick={() => document.getElementById(`avatar-input-${member.id}`)?.click()}
                >
                  <Pencil size={14} />
                </button>
                <input
                  type="file"
                  id={`avatar-input-${member.id}`}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      onAvatarChange(member.id, file);
                    }
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="pt-16 pb-6 px-6">
        {/* Name and Role */}
        <div className={`text-${language === 'ar' ? 'right' : 'left'} mb-4`}>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{fullName || t.noName}</h3>
          {member.role && <span className={`inline-flex items-center px-2 py-1 text-xs rounded-lg border ${roleMeta.cls}`}>{roleMeta.label}</span>}
        </div>

        {/* Status */}
        {member.status && (
          <div className={`flex items-center gap-1 mb-4 text-gray-600 justify-${language === 'ar' ? 'end' : 'start'}`}>
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border ${statusMeta.cls}`}>
              <statusMeta.icon size={14} /> {statusMeta.label}
            </span>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          {member.email && (
            <div className={`flex items-center gap-2 text-sm text-gray-600 justify-${language === 'ar' ? 'end' : 'start'}`}>
              <span className="truncate">{member.email}</span>
              <Mail className="w-4 h-4" />
            </div>
          )}
          {member.phone && (
            <div className={`flex items-center gap-2 text-sm text-gray-600 justify-${language === 'ar' ? 'end' : 'start'}`}>
              <span>{member.phone}</span>
              <Phone className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Join Date and Actions */}
        <div className={`flex items-center justify-between pt-4 border-t border-gray-100 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{formatJoinDate(member.joined)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onView && (
              <button 
                onClick={() => onView(member)}
                className="p-1.5 rounded-full hover:bg-blue-100 transition-colors text-blue-600"
                title={t.view}
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button 
                onClick={() => onEdit(member)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                title={t.edit}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(member.id)}
                className="p-1.5 rounded-full hover:bg-red-100 transition-colors text-red-600"
                title={t.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TeamMemberCard;
