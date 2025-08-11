/**
 * Mapping Panel Component
 * 
 * Allows users to map PDF template fields to database columns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  MapPin, 
  Save, 
  ChevronDown, 
  ChevronRight,
  Database,
  FileText 
} from 'lucide-react';
import { toast } from 'sonner';
import { extractFieldsFromTemplate } from '../../lib/pdf/pdfmeUtils';
import type { FieldMapping, PdfField, DatabaseColumn } from '../../lib/pdf/types';

interface MappingPanelProps {
  template: any;
  initialMapping?: FieldMapping;
  onChange?: (mapping: FieldMapping) => void;
  onSave?: (mapping: FieldMapping) => void;
  isLoading?: boolean;
}

// Available database columns for mapping
const AVAILABLE_COLUMNS: DatabaseColumn[] = [
  // Customer fields
  { table: 'customers', column: 'name', type: 'text', label: 'Customer Name' },
  { table: 'customers', column: 'email', type: 'text', label: 'Customer Email' },
  { table: 'customers', column: 'phone', type: 'text', label: 'Customer Phone' },
  { table: 'customers', column: 'company', type: 'text', label: 'Customer Company' },
  { table: 'customers', column: 'address', type: 'text', label: 'Customer Address' },
  
  // Offer fields
  { table: 'offers', column: 'id', type: 'text', label: 'Offer ID' },
  { table: 'offers', column: 'number', type: 'text', label: 'Offer Number' },
  { table: 'offers', column: 'title', type: 'text', label: 'Offer Title' },
  { table: 'offers', column: 'date', type: 'date', label: 'Offer Date' },
  { table: 'offers', column: 'valid_until', type: 'date', label: 'Valid Until' },
  { table: 'offers', column: 'subtotal', type: 'currency', label: 'Subtotal' },
  { table: 'offers', column: 'tax', type: 'currency', label: 'Tax Amount' },
  { table: 'offers', column: 'total', type: 'currency', label: 'Total Amount' },
  { table: 'offers', column: 'currency', type: 'text', label: 'Currency' },
  { table: 'offers', column: 'notes', type: 'text', label: 'Offer Notes' },
  
  // Company fields
  { table: 'company', column: 'name', type: 'text', label: 'Company Name' },
  { table: 'company', column: 'address', type: 'text', label: 'Company Address' },
  { table: 'company', column: 'phone', type: 'text', label: 'Company Phone' },
  { table: 'company', column: 'email', type: 'text', label: 'Company Email' },
  { table: 'company', column: 'logo', type: 'image', label: 'Company Logo' },
  
  // Computed fields
  { table: 'computed', column: 'current_date', type: 'computed', label: 'Current Date' },
  { table: 'computed', column: 'current_datetime', type: 'computed', label: 'Current Date & Time' },
  { table: 'computed', column: 'items_count', type: 'computed', label: 'Items Count' },
  { table: 'computed', column: 'items_total', type: 'computed', label: 'Items Total' },
];

const TYPE_FORMATS = {
  date: ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'long'],
  currency: ['USD:en-US', 'EUR:en-EU', 'TRY:tr-TR'],
  number: ['0', '2', '4'],
};

export const MappingPanel: React.FC<MappingPanelProps> = ({
  template,
  initialMapping = {},
  onChange,
  onSave,
  isLoading = false,
}) => {
  const [mapping, setMapping] = useState<FieldMapping>(initialMapping);
  const [showPreview, setShowPreview] = useState(false);

  // Extract fields from template
  const templateFields = useMemo(() => {
    if (!template) return [];
    return extractFieldsFromTemplate(template);
  }, [template]);

  // Update mapping when initialMapping changes
  useEffect(() => {
    setMapping(initialMapping);
  }, [initialMapping]);

  // Group database columns by table
  const columnsByTable = useMemo(() => {
    const grouped: Record<string, DatabaseColumn[]> = {};
    AVAILABLE_COLUMNS.forEach(column => {
      if (!grouped[column.table]) {
        grouped[column.table] = [];
      }
      grouped[column.table].push(column);
    });
    return grouped;
  }, []);

  const handleFieldMapping = (
    fieldName: string,
    table: string,
    column: string,
    type: string
  ) => {
    const newMapping = {
      ...mapping,
      [fieldName]: {
        table,
        column,
        type: type as any,
      },
    };

    setMapping(newMapping);
    onChange?.(newMapping);
  };

  const handleFormatChange = (fieldName: string, format: string) => {
    const newMapping = {
      ...mapping,
      [fieldName]: {
        ...mapping[fieldName],
        format,
      },
    };

    setMapping(newMapping);
    onChange?.(newMapping);
  };

  const handleComputationChange = (fieldName: string, computation: string) => {
    const newMapping = {
      ...mapping,
      [fieldName]: {
        ...mapping[fieldName],
        computation,
      },
    };

    setMapping(newMapping);
    onChange?.(newMapping);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(mapping);
      toast.success('Field mapping saved successfully');
    }
  };

  const getMappingStatus = () => {
    const mappedCount = Object.keys(mapping).length;
    const totalCount = templateFields.length;
    return { mapped: mappedCount, total: totalCount };
  };

  const status = getMappingStatus();

  if (!template || templateFields.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Template Fields</h3>
          <p className="text-muted-foreground">
            Please create or load a template with fields to set up field mapping.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <CardTitle>Field Mapping</CardTitle>
              <Badge variant="secondary">
                {status.mapped}/{status.total} mapped
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Preview JSON
              </Button>
              {onSave && (
                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Mapping
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {showPreview && (
          <CardContent className="pt-0">
            <details className="border rounded p-4">
              <summary className="font-medium cursor-pointer">
                Mapping JSON Preview
              </summary>
              <pre className="mt-4 text-sm bg-muted p-4 rounded overflow-auto">
                {JSON.stringify(mapping, null, 2)}
              </pre>
            </details>
          </CardContent>
        )}
      </Card>

      {/* Field Mappings */}
      <div className="space-y-4">
        {templateFields.map((field) => {
          const fieldMapping = mapping[field.name];
          const selectedColumn = fieldMapping 
            ? AVAILABLE_COLUMNS.find(
                col => col.table === fieldMapping.table && col.column === fieldMapping.column
              )
            : null;

          return (
            <Card key={field.name}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Field Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{field.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Type: {field.type} {field.required && '(Required)'}
                      </div>
                    </div>
                    {fieldMapping && (
                      <Badge variant="outline" className="text-green-600">
                        Mapped
                      </Badge>
                    )}
                  </div>

                  {/* Database Column Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Database Column</Label>
                      <Select
                        value={selectedColumn ? `${selectedColumn.table}.${selectedColumn.column}` : ''}
                        onValueChange={(value) => {
                          const [table, column] = value.split('.');
                          const col = AVAILABLE_COLUMNS.find(
                            c => c.table === table && c.column === column
                          );
                          if (col) {
                            handleFieldMapping(field.name, table, column, col.type);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select database column..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {Object.entries(columnsByTable).map(([tableName, columns]) => (
                            <div key={tableName}>
                              <div className="px-2 py-1 text-sm font-medium text-muted-foreground border-b">
                                <Database className="h-3 w-3 inline mr-1" />
                                {tableName.charAt(0).toUpperCase() + tableName.slice(1)}
                              </div>
                              {columns.map((column) => (
                                <SelectItem
                                  key={`${column.table}.${column.column}`}
                                  value={`${column.table}.${column.column}`}
                                  className="pl-6"
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{column.label}</span>
                                    <Badge variant="outline" className="text-xs ml-2">
                                      {column.type}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Format Selection for specific types */}
                    {fieldMapping && selectedColumn && TYPE_FORMATS[selectedColumn.type as keyof typeof TYPE_FORMATS] && (
                      <div>
                        <Label>Format</Label>
                        <Select
                          value={fieldMapping.format || ''}
                          onValueChange={(value) => handleFormatChange(field.name, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select format..." />
                          </SelectTrigger>
                          <SelectContent>
                            {TYPE_FORMATS[selectedColumn.type as keyof typeof TYPE_FORMATS].map((format) => (
                              <SelectItem key={format} value={format}>
                                {format}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Computation for computed fields */}
                    {fieldMapping && selectedColumn?.type === 'computed' && (
                      <div className="md:col-span-2">
                        <Label>Computation</Label>
                        <Select
                          value={fieldMapping.computation || ''}
                          onValueChange={(value) => handleComputationChange(field.name, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select computation..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current_date">Current Date</SelectItem>
                            <SelectItem value="current_datetime">Current Date & Time</SelectItem>
                            <SelectItem value="count:items">Count Items</SelectItem>
                            <SelectItem value="sum:items.total">Sum Item Totals</SelectItem>
                            <SelectItem value="concat:customer.name,customer.company">
                              Concat Customer Info
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {status.mapped} of {status.total} fields mapped
            </div>
            <div className="w-32 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${status.total > 0 ? (status.mapped / status.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};