'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

const UserSelectItem = ({ user }: { user: any }) => (
  <div className="py-2 px-4 hover:bg-accent transition duration-150 ease-in-out">
    <div className="font-semibold text-lg">{user.name}</div>
    <div className="flex flex-wrap gap-2 mt-1">
      <Badge variant="secondary"> {user.phoneNumber}</Badge>
      <Badge variant="secondary"> {user.email}</Badge>
      <Badge variant="secondary"> {user.city}</Badge>
      <Badge variant="secondary"> {user.state}</Badge>
      <Badge variant="secondary"> {user.pincode}</Badge>
    </div>
  </div>
);

const LeadStatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    new: "default",
    contacted: "secondary",
    successful: "outline",
    lost: "destructive"
  };

  return (
    <Badge variant={variants[status] || "default"}>
      {status}
    </Badge>
  );
};

const FileUploadZone = ({ onFileSelect, uploading }: { onFileSelect: (file: File) => void, uploading: boolean }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'csv' && fileType !== 'xlsx') {
      alert('Please upload a CSV or Excel file');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed p-6 transition-all",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          selectedFile ? "bg-muted/50" : "hover:bg-muted/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <File className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={removeFile}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Drag & drop your file here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV and Excel files
                </p>
              </div>
            </>
          )}
          
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LeadPage = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobileNo: '',
    email: '',
    city: '',
    platform: 'Facebook',
    assignedTo: ''
  });

  const platforms = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'];
  const statuses = ['new', 'contacted', 'successful', 'lost'];

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/partners');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormData({
          name: '',
          mobileNo: '',
          email: '',
          city: '',
          platform: 'Facebook',
          assignedTo: ''
        });
        fetchLeads();
      }
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleUpdate = async (leadId: string, updatedData: any) => {
    try {
        const response = await fetch(`/api/leads?id=${leadId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        if (response.ok) {
            fetchLeads(); 
        } else {
            const errorData = await response.json();
            console.error('Error updating lead:', errorData.error);
        }
    } catch (error) {
        console.error('Error updating lead:', error);
    }
  };

  const getUserDisplayName = (assignedTo: any) => {
    if (!assignedTo || !assignedTo.name) return 'Not Assigned';
    return `${assignedTo.name}${assignedTo.phoneNumber ? `, ${assignedTo.phoneNumber}` : ''}`;
  };

  const handleFileUpload = async (formData: FormData) => {
    setUploading(true);
    try {
      const response = await fetch('/api/leads/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully uploaded ${result.count} leads`);
        fetchLeads(); // Refresh the leads list
      } else {
        const error = await response.json();
        alert(`Error uploading file: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <Label className="text-base font-semibold">Upload CSV/Excel File</Label>
            <FileUploadZone onFileSelect={(file) => {
              const formData = new FormData();
              formData.append('file', file);
              handleFileUpload(formData);
            }} uploading={uploading} />
            <Alert>
              <AlertDescription>
                Upload a CSV or Excel file with columns: name, mobileNo, email, city, platform
              </AlertDescription>
            </Alert>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Mobile Number"
                value={formData.mobileNo}
                onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      <UserSelectItem user={user} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Add Lead</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length > 0 ? leads.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.mobileNo}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.city}</TableCell>
                    <TableCell>{lead.platform}</TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {getUserDisplayName(lead.assignedTo)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Update</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Lead</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Select
                              defaultValue={lead.status}
                              onValueChange={(value) => handleUpdate(lead._id, { status: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              defaultValue={lead.assignedTo?._id || ''}
                              onValueChange={(value) => handleUpdate(lead._id, { assignedTo: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select User" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user._id} value={user._id}>
                                    <UserSelectItem user={user} />
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8}>No leads at the moment</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadPage;
