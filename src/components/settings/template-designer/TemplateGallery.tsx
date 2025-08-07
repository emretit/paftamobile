import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  Edit, 
  Copy, 
  Star, 
  Clock, 
  Users, 
  Filter,
  Search,
  Grid3X3,
  List,
  Plus,
  Download,
  Upload,
  Trash2,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProposalTemplate } from '@/types/proposal-template';

interface TemplateGalleryProps {
  templates: ProposalTemplate[];
  onCreateNew: () => void;
  onEdit: (template: ProposalTemplate) => void;
  onPreview: (template: ProposalTemplate) => void;
  onDuplicate: (template: ProposalTemplate) => void;
  onDelete: (template: ProposalTemplate) => void;
  onImport: () => void;
  onExport: (template: ProposalTemplate) => void;
  onUseTemplate: (template: ProposalTemplate) => void;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'recommended' | 'recent' | 'popular' | 'my-templates';

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  onCreateNew,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onImport,
  onExport,
  onUseTemplate
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'recommended' && template.isRecommended) ||
                         (filterType === 'popular' && (template.popularity || 0) > 3) ||
                         (filterType === 'recent' && new Date(template.created_at || '').getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const matchesCategory = selectedCategory === 'all' || template.templateType === selectedCategory;
    
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavorites(newFavorites);
  };

  const categories = [
    { value: 'all', label: 'Tüm Kategoriler' },
    { value: 'standard', label: 'Standart' },
    { value: 'modern', label: 'Modern' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'corporate', label: 'Kurumsal' },
    { value: 'creative', label: 'Yaratıcı' }
  ];

  const filterOptions = [
    { value: 'all', label: 'Tümü' },
    { value: 'recommended', label: 'Önerilen' },
    { value: 'recent', label: 'Son Eklenen' },
    { value: 'popular', label: 'Popüler' },
    { value: 'my-templates', label: 'Şablonlarım' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Şablon Galerisi</h2>
          <p className="text-muted-foreground">
            Profesyonel teklif şablonları oluşturun ve yönetin
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onImport} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            İçe Aktar
          </Button>
          <Button onClick={onCreateNew} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Şablon
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Şablon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Templates Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isFavorite={favorites.has(template.id)}
              onToggleFavorite={() => toggleFavorite(template.id)}
              onEdit={() => onEdit(template)}
              onPreview={() => onPreview(template)}
              onDuplicate={() => onDuplicate(template)}
              onDelete={() => onDelete(template)}
              onExport={() => onExport(template)}
              onUse={() => onUseTemplate(template)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTemplates.map((template) => (
            <TemplateListItem
              key={template.id}
              template={template}
              isFavorite={favorites.has(template.id)}
              onToggleFavorite={() => toggleFavorite(template.id)}
              onEdit={() => onEdit(template)}
              onPreview={() => onPreview(template)}
              onDuplicate={() => onDuplicate(template)}
              onDelete={() => onDelete(template)}
              onExport={() => onExport(template)}
              onUse={() => onUseTemplate(template)}
            />
          ))}
        </div>
      )}

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Şablon bulunamadı</p>
            <p>Arama kriterlerinizi değiştirin veya yeni bir şablon oluşturun</p>
          </div>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            İlk Şablonunuzu Oluşturun
          </Button>
        </div>
      )}
    </div>
  );
};

interface TemplateCardProps {
  template: ProposalTemplate;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
  onUse: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onExport,
  onUse
}) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-sm font-medium line-clamp-1">
                {template.name}
              </CardTitle>
              {template.isRecommended && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Önerilen
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs line-clamp-2">
              {template.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFavorite}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-red-500 text-red-500")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Preview Image Placeholder */}
        <div className="aspect-[4/3] bg-muted rounded-md mb-3 flex items-center justify-center">
          {template.previewImage ? (
            <img 
              src={template.previewImage} 
              alt={template.name}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <div className="text-muted-foreground text-center">
              <Grid3X3 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs">Önizleme</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{template.usageCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{template.estimatedTime || '5dk'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            <span>{template.popularity || 0}</span>
          </div>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {template.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{template.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-1 w-full">
          <Button onClick={onUse} size="sm" className="flex-1">
            Kullan
          </Button>
          <Button onClick={onPreview} variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
          <Button onClick={onDuplicate} variant="outline" size="sm">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

interface TemplateListItemProps extends TemplateCardProps {}

const TemplateListItem: React.FC<TemplateListItemProps> = ({
  template,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onExport,
  onUse
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Preview Thumbnail */}
          <div className="w-16 h-12 bg-muted rounded flex-shrink-0 flex items-center justify-center">
            {template.previewImage ? (
              <img 
                src={template.previewImage} 
                alt={template.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <Grid3X3 className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{template.name}</h3>
              {template.isRecommended && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Önerilen
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {template.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {template.usageCount || 0} kullanım
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {template.estimatedTime || '5dk'}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {template.popularity || 0}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-red-500 text-red-500")} />
            </Button>
            <Button onClick={onPreview} variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button onClick={onDuplicate} variant="outline" size="sm">
              <Copy className="w-4 h-4" />
            </Button>
            <Button onClick={onUse} size="sm">
              Kullan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};