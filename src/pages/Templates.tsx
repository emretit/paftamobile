/**
 * Templates List Page
 * 
 * Displays and manages PDF templates for the active project.
 * Provides CRUD operations, search, and template management features.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Copy, 
  Trash2, 
  Star, 
  StarOff,
  ExternalLink 
} from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';
import { useActiveProject } from '@/hooks/useActiveProject';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export const Templates: React.FC = () => {
  const { activeProject, hasWriteAccess } = useActiveProject();
  const { templates, isLoading, setDefaultTemplate, duplicateTemplate, deleteTemplate } = useTemplates();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSetDefault = async (templateId: string) => {
    if (!hasWriteAccess) {
      toast.error('You do not have permission to modify templates');
      return;
    }
    
    try {
      await setDefaultTemplate(templateId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDuplicate = async (template: any) => {
    if (!hasWriteAccess) {
      toast.error('You do not have permission to create templates');
      return;
    }

    try {
      await duplicateTemplate(template);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!hasWriteAccess) {
      toast.error('You do not have permission to delete templates');
      return;
    }

    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(templateId);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  if (!activeProject) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No Active Project</h2>
            <p className="text-muted-foreground">
              Please select or create a project to manage templates.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PDF Templates</h1>
          <p className="text-muted-foreground">
            Manage PDF templates for {activeProject.name}
          </p>
        </div>
        
        {hasWriteAccess && (
          <Button asChild>
            <Link to="/templates/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Link>
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-3 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? `No templates match "${searchTerm}"`
                : 'Get started by creating your first PDF template'
              }
            </p>
            {hasWriteAccess && !searchTerm && (
              <Button asChild>
                <Link to="/templates/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {template.name}
                      {template.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(template.id)}
                    disabled={!hasWriteAccess}
                    title={template.is_default ? 'Remove as default' : 'Set as default'}
                  >
                    {template.is_default ? (
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </div>
                  
                  {/* Template Stats */}
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(template.template_json?.schemas?.[0] || {}).length} fields
                    </Badge>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link to={`/templates/${template.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    
                    {hasWriteAccess && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Templates;