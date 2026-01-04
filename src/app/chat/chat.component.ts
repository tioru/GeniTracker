import { CommonModule, KeyValue } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogComponent, DialogStyle } from '../components/dialog/dialog.component';
import { FormsModule } from '@angular/forms';
import { Database, onValue, ref } from '@angular/fire/database';
import { ProjectClass } from '../../utilities/classes/class';
import { GroupMapper } from '../../utilities/mapper/group';
import { MessageMapper } from '../../utilities/mapper/message';
import { UserService } from '../../utilities/services/user.service';
import { User } from '@angular/fire/auth';
import { ImageCacheService } from '../../utilities/services/image-cache.service';
import { TooltipComponent } from '../components/tooltip/tooltip.component';
import { animations } from '../animation';
import { MessageService } from '../../utilities/services/message.service';
import { NotificationService, notificationSeverity } from '../../utilities/services/notification.service';
import { DatabaseService } from '../../utilities/services/database.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { from, Observable } from 'rxjs';

const DEFAULT_GROUP_NAME = "Général";
const SCROLLBAR_THRESHOLD = 100;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export enum MESSAGE_MODE {
  CREATE,
  UPDATE
}

export enum SLIDE_BAR_VISIBILITY {
  REDUCED = 1,
  NORMAL = 2
}

export enum NEW_GROUP_DIALOG_TAB {
  SET_DISPLAY_NAME,
  SET_DESCRIPTION,
  SET_PICTURE
}

export enum SUPPORTED_PREVIEW_FILE {
  IMG,
  VIDEO,
  DOCUMENT,
  AUDIO
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, DialogComponent, FormsModule, TooltipComponent],
  templateUrl: './chat.component.html',
  animations: animations,
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy{
  private database = inject(Database);
  
  private dbRef = ref(this.database, 'groups');

  public dialogStyle : typeof DialogStyle = DialogStyle;

  public groups : { [key: string]: ProjectClass.Local.GroupItem } = {};

  public selectedGroupKey : string = "";

  public newMessageContent : string = "";

  public messagesSortedByDate : {[key : string]: ProjectClass.Local.Message[]} = {}

  @Input() chatVisibility : boolean = false;

  @Input() onCloseCallBack : () => void = () => {};

  public currentUser : User | null = null;

  public currentCustomUser : ProjectClass.Local.User | null = null;

  private notificationSeverity : typeof notificationSeverity = notificationSeverity;

  public messageMode : typeof MESSAGE_MODE = MESSAGE_MODE;

  public selectedMessageMode : MESSAGE_MODE = MESSAGE_MODE.CREATE;

  public selectedMessageToUpdate : ProjectClass.Local.Message | null = null;

  private intersectionObserver?: IntersectionObserver;

  public unreadMessages : number = 0;

  public selectedSlideBarVisibility : SLIDE_BAR_VISIBILITY = SLIDE_BAR_VISIBILITY.NORMAL;

  public slideBarVisibility : typeof SLIDE_BAR_VISIBILITY = SLIDE_BAR_VISIBILITY;

  public newGroupDialogVisibility : boolean = false;

  public selectedNewGroupDialogTab : NEW_GROUP_DIALOG_TAB = NEW_GROUP_DIALOG_TAB.SET_DISPLAY_NAME;

  public newGroupDialogTab : typeof NEW_GROUP_DIALOG_TAB = NEW_GROUP_DIALOG_TAB;

  public newGroup : ProjectClass.Local.GroupItem = new ProjectClass.Local.GroupItem();

  public newGroupRequestCreationLoading : boolean = false;

  public groupCreationFinished : boolean = false;

  public attachedFiles: ProjectClass.Local.AttachedFile[] = [];

  public supportedPreviewFile : typeof SUPPORTED_PREVIEW_FILE = SUPPORTED_PREVIEW_FILE;

  public previewFileDialogVisibilty : boolean = false;

  public previewedFile : ProjectClass.Local.AttachedFile | null = null;

  public isDragging : boolean = false;

  public jsonContent: string | null = null;

  public textContent: string | null = null;

  ngOnInit() {
    this.chatListening();
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.userService.getUserByUID(user?.uid!).then((customUser) => {
        this.currentCustomUser = customUser;
      });
      this.chatListening();
    });
  }

  constructor(
    public userService : UserService,
    public groupMapper : GroupMapper,
    public messageMapper : MessageMapper,
    public imageCacheService : ImageCacheService,
    public messageService : MessageService,
    public notificationService : NotificationService,
    public databaseService : DatabaseService,
    private sanitizer: DomSanitizer
  ) {}

  private chatListening() {
    onValue(this.dbRef, (snapshot) => {
      if (snapshot.exists()) {
        this.groupMapper.mapRemoteDict(snapshot.val()).then((result) => {
          this.groups = result;

          if (this.isNearTheBottom()) {
            this.goToBottom()
          }

          if (!this.selectedGroupKey) {
            Object.keys(this.groups).forEach((groupKey) => {
              if (this.groups[groupKey].name === DEFAULT_GROUP_NAME) {
                this.selectedGroupKey = groupKey;
              }
            });
          }

          if (!this.selectedGroupKey) {
            this.selectedGroupKey = Object.keys(this.groups)[0];
          }

          this.sortMessagesByDate();

          if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
          }

          this.initializeMessageObserver();
          setTimeout(() => {
            this.observeAllMessages();
          }, 100);
        });
      }
    });
  };

  get groupsNames() : string[] {
    return Object.entries(this.groups).sort((a, b) => {
      const dateA = a[1].createdAt ? new Date(a[1].createdAt).getTime() : 0;
      const dateB = b[1].createdAt ? new Date(b[1].createdAt).getTime() : 0;
      return dateA - dateB;
    })
    .map(([key, group]) => group.name!);
  }

  public openGroup(groupKey: string): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    this.selectedGroupKey = groupKey;
    this.sortMessagesByDate();
    this.goToBottom();


    setTimeout(() => {
      this.observeAllMessages();
    }, 100);
  }

  private observeAllMessages(): void {
    if (!this.intersectionObserver) return;

    const messageElements = document.querySelectorAll('.messageItem');
    messageElements.forEach(el => {
      this.intersectionObserver!.observe(el);
    });
  }

  public async sendMessage(): Promise<void> {
    if (!this.currentUser) return;

    const message = new ProjectClass.Local.Message({
      id: null,
      message: this.newMessageContent,
      date: new Date(),
      user: this.currentCustomUser,
      modified: false,
      seenBy: [this.currentCustomUser!],
      attachedFiles: this.attachedFiles
    })

    this.messageService.sendMessage(message, this.selectedGroupKey).then(() => {
      this.newMessageContent = "";
      this.attachedFiles = [];
      setTimeout(() => this.observeAllMessages(), 100);
    });
  }

  public getGroupKeyByName(groupName: string): string {
    for (const [key, group] of Object.entries(this.groups)) {
      if (group.name === groupName) {
        return key;
      }
    }
    return "";
  }

  public getGroupBykey(key : string) : ProjectClass.Local.GroupItem {
    return this.groups[key];
  }

  public getLastMessager(groupKey: string) : string {
    if (Object.values(this.groups[groupKey].messages).length > 0) {
      return Object.values(this.groups[groupKey].messages).sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
        })[Object.values(this.groups[groupKey].messages).length - 1].user?.displayName!
    }
    return ""
  }

  public getTimeSinceLastMessage(groupKey: string) : string {
    const lastMessage = Object.values(this.groups[groupKey].messages).sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
    })[Object.values(this.groups[groupKey].messages).length - 1];
    
    if (!lastMessage || !lastMessage.date) return "";
    
    return this.getTimeSince(lastMessage.date);
  }

  public createNewGroup() : void {
    const inputField = document.querySelector('.input.pictureLink') as HTMLInputElement;
    const isValid = this.newGroup.description!.trim().length > 0;

    inputField.classList.toggle('error', !isValid);

    if (isValid) {
      this.newGroup.createdBy = this.currentCustomUser;
      this.messageService.createGroup(this.newGroup).then(() => {
        this.newGroupDialogVisibility = false;
        this.selectedNewGroupDialogTab = NEW_GROUP_DIALOG_TAB.SET_DISPLAY_NAME;
        this.newGroup = new ProjectClass.Local.GroupItem();
        this.groupCreationFinished = true;
      })
    }
  }

  public getCurrentGroupMessages() : ProjectClass.Local.Message[] {
    return Object.values(this.groups[this.selectedGroupKey].messages).sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });
  }

  public getTimeSince(date: Date | string): string {
    if (!date) return "";

    const messageDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - messageDate.getTime();

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
        return "à l'instant";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} min`;
    } else if (diffInHours < 24) {
        return `${diffInHours} h`;
    } else {
        return `${diffInDays} j`;
    }
  }

  public isNearTheBottom(): boolean {
    const messagesDisplay = document.querySelector('.messagesDisplay') as HTMLElement;
    
    if (!messagesDisplay) {
      return false;
    }

    const scrollTop = messagesDisplay.scrollTop;
    const scrollHeight = messagesDisplay.scrollHeight;
    const clientHeight = messagesDisplay.clientHeight;

    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    return distanceFromBottom <= SCROLLBAR_THRESHOLD;
  }

  public goToBottom() : void {
    setTimeout(() => {
      const messagesDisplay = document.querySelector('.messagesDisplay') as HTMLElement;
      if (messagesDisplay) {
        messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
      }
    }, 0);
  }

  public async updateMessage() : Promise<void> {
    if (this.currentCustomUser?.uid !== this.selectedMessageToUpdate!.user?.uid) {
      this.notificationService.addNotification({
        title: 'Modification impossible',
        severity: this.notificationSeverity.ERROR,
        detail: `La modification d'un message n'est possible que pour son créateur.`,
        sticky: true
      });
      return;
    }

    if (this.selectedMessageToUpdate!.message!.trim().length <= 0 && this.attachedFiles.length <= 0) {
      this.notificationService.addNotification({
        title: 'Modification impossible',
        severity: this.notificationSeverity.ERROR,
        detail: `Le message doit au moins contenir un message ou un fichier.`,
        sticky: true
      });
      return;
    }

    const originalFiles = this.getCurrentGroupMessages().find((message) => message.id === this.selectedMessageToUpdate?.id)?.attachedFiles || [];

    const filesToAdd = this.attachedFiles.filter((attachedFile) => 
      !originalFiles.some((originalFile) => 
        originalFile.file?.name === attachedFile.file?.name &&
        originalFile.file?.size === attachedFile.file?.size &&
        originalFile.file?.type === attachedFile.file?.type
      )
    );

    if (filesToAdd.length > 0) {
      const uploadedFiles = await this.databaseService.uploadFilesArrayToBucket(filesToAdd);
      this.selectedMessageToUpdate!.attachedFiles = [...originalFiles, ...uploadedFiles];
    }

    const filesToDelete = originalFiles.filter(
      file => !new Set(this.attachedFiles.map(file => file.id)).has(file.id)
    );

    if (filesToDelete.length > 0) {
      await this.databaseService.deleteFilesArray(filesToDelete);
      this.selectedMessageToUpdate!.attachedFiles = this.selectedMessageToUpdate!.attachedFiles.filter(
        (attachedFile) => !filesToDelete.some((fileToDelete) => fileToDelete.id === attachedFile.id)
      );
    }

    console.log(this.selectedMessageToUpdate!.attachedFiles)

    this.messageService.updateMessage(this.selectedGroupKey, this.selectedMessageToUpdate!).then((result) => {
      if (result) {
        this.exitUpdateMode();
      }
    })
  }

  public deleteMessage(message : ProjectClass.Local.Message) : void {
    if (this.currentCustomUser?.uid !== message.user?.uid) {
      this.notificationService.addNotification({
        title: 'Suppression impossible',
        severity: this.notificationSeverity.ERROR,
        detail: `La suppression d'un message n'est possible que pour son créateur.`,
        sticky: true
      });
    } else {      
      this.messageService.deleteMessage(this.selectedGroupKey, message.id!)
    }
  }

  public get messageInputContent(): string {
    return this.selectedMessageMode === this.messageMode.UPDATE && this.selectedMessageToUpdate 
      ? this.selectedMessageToUpdate.message! 
      : this.newMessageContent;
  }

  public set messageInputContent(value: string) {
    if (this.selectedMessageMode === this.messageMode.UPDATE && this.selectedMessageToUpdate) {
      this.selectedMessageToUpdate.message = value;
    } else {
      this.newMessageContent = value;
    }
  }

  public selectMessageForUpdate(message : ProjectClass.Local.Message) : void {
    this.selectedMessageToUpdate = structuredClone(message);
    this.attachedFiles = structuredClone(this.selectedMessageToUpdate.attachedFiles);
    this.selectedMessageToUpdate.modified = true;
    setTimeout(() => {
      this.updateTextArea();
    }, 0)
  }

  public exitUpdateMode() : void {
    this.selectedMessageMode = MESSAGE_MODE.CREATE;
    this.selectedMessageToUpdate = null;
    this.attachedFiles = [];
    setTimeout(() => {
      this.updateTextArea();
    }, 0)
  }

  public trackByMessageId(index: number, message: ProjectClass.Local.Message): string {
    return message.id || index.toString();
  }

  trackByDate(index: number, item: KeyValue<string, ProjectClass.Local.Message[]>): string {
    return item.key;
  }

  private initializeMessageObserver(): void {
    const options = {
      root: document.querySelector('.messagesDisplay'),
      rootMargin: '0px',
      threshold: 0.5 // 50% du message doit être visible
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const messageId = entry.target.getAttribute('data-message-id');
        if (!messageId) return;

        if (entry.isIntersecting) {
          this.markMessageAsSeen(messageId);
        }
      });
    }, options);
  }

  private markMessageAsSeen(messageId: string): void {
    if (!this.currentCustomUser) return;

    const message = this.getCurrentGroupMessages().find(message => message.id === messageId);
    if (!message) return;

    this.messageService.markMessageAsSeen(this.selectedGroupKey, messageId, this.currentCustomUser.uid!);
  }

  public isMessageSeenByCurrentUser(message: ProjectClass.Local.Message): boolean {
    if (!this.currentCustomUser) return false;
    return message.seenBy?.some(user => user.uid === this.currentCustomUser!.uid) || false;
  }

  public onChatVisible() : void {
    this.goToBottom()
    this.getCurrentGroupMessages().forEach((message) => {
      this.markMessageAsSeen(message.id!)
    })
    setTimeout(() => {
      this.observeAllMessages();
    }, 100);
  }

  public isMessageSeen(message: ProjectClass.Local.Message): boolean {
    return message.seenBy.filter((user) => user.uid !== this.currentCustomUser?.uid).length > 0
  }

  public switchSlideBarVisibility() : void {
    if (this.selectedSlideBarVisibility === SLIDE_BAR_VISIBILITY.NORMAL) {
      this.selectedSlideBarVisibility = SLIDE_BAR_VISIBILITY.REDUCED;
    } else {
      this.selectedSlideBarVisibility = SLIDE_BAR_VISIBILITY.NORMAL;
    }
  }

  public sortMessagesByDate(): void {
    this.messagesSortedByDate = {};
    
    this.getCurrentGroupMessages().forEach(message => {
      if (message.date) {

        const date = new Date(message.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        if (!this.messagesSortedByDate[dateKey]) {
          this.messagesSortedByDate[dateKey] = [];
        }

        this.messagesSortedByDate[dateKey].push(message);
      }
    });
  
    Object.keys(this.messagesSortedByDate).forEach(dateKey => {
      this.messagesSortedByDate[dateKey].sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return a.date.getTime() - b.date.getTime();
      });
    });
  }

  public checkDisplayName(event: Event) {
    const inputField = document.querySelector('.input.displayname') as HTMLInputElement;
    const isValid = this.newGroup.name!.trim().length > 0;
    const isSubmitEvent = (event instanceof KeyboardEvent && event.code === 'Enter') || 
                          (event instanceof MouseEvent);

    inputField.classList.toggle('error', !isValid);

    if (!isValid && isSubmitEvent) {
      // Wave animation to indicate error
    }

    if (isValid && isSubmitEvent) {
      this.selectedNewGroupDialogTab = this.newGroupDialogTab.SET_DESCRIPTION;
    }
  }

  public checkDescription(event: Event) {
    const inputField = document.querySelector('.input.pictureLink') as HTMLInputElement;
    const isValid = this.newGroup.description!.trim().length > 0;
    const isSubmitEvent = (event instanceof KeyboardEvent && event.code === 'Enter') || 
                          (event instanceof MouseEvent);

    inputField.classList.toggle('error', !isValid);

    if (!isValid && isSubmitEvent) {
      // Wave animation to indicate error
    }

    if (isValid && isSubmitEvent) {
      this.selectedNewGroupDialogTab = this.newGroupDialogTab.SET_PICTURE;
    }
  }

  get getUnreadMessages(): number {
    return this.getCurrentGroupMessages().filter(message => !this.isMessageSeenByCurrentUser(message)).length;
  }

  public updateTextArea() : void {
    const textarea = document.getElementById('expandingInput') as HTMLTextAreaElement;

    if (textarea) {
      textarea.style.height = 'auto';
        
      const newHeight = textarea.scrollHeight;
        
      if (newHeight <= 200) {
          textarea.style.height = newHeight + 'px';
          textarea.classList.remove('scrollable');
      } else {
          textarea.style.height = '200px';
          textarea.classList.add('scrollable');
      }
    } else {
      console.error("TextArea is not defined");
    }
  }

  public initPasteListener(): void {
    const textarea = document.getElementById('expandingInput') as HTMLTextAreaElement;
    if (textarea) {
        textarea.addEventListener('paste', (e) => this.handlePaste(e));
    }
  }

  public handlePaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.kind.includes("string")) {
        return;
      }

      if (!item.kind.includes("file")) {
        this.notificationService.addNotification({
          title: 'Erreur',
          severity: notificationSeverity.ERROR,
          detail: `Type de fichier non supporté.`,
          sticky: true,
        });
        return;
      }

      event.preventDefault();
      const file = item.getAsFile();

      if (file) {
        this.verifyNewFile(file)
      } else {
        throw new Error("Une erreur s'est produite lors de la récupération du fichier.")
      }
    }
  }

  public removeFile(attachedFile : ProjectClass.Local.AttachedFile): void {
    const fileIndex = this.attachedFiles.indexOf(attachedFile);
    this.attachedFiles.splice(fileIndex, 1);
  }

  public getFileUrl(file: File | null): string {
    if (!file) return '';

    return URL.createObjectURL(file);
  }

  public getFileType(attachedFile : ProjectClass.Local.AttachedFile) : SUPPORTED_PREVIEW_FILE {
    if (attachedFile.file?.type.includes("image")) {
      return this.supportedPreviewFile.IMG
    } else if (attachedFile.file?.type.includes("video")) {
      return this.supportedPreviewFile.VIDEO
    } else if (attachedFile.file?.type.includes("audio")) {
      return this.supportedPreviewFile.AUDIO
    }
    return this.supportedPreviewFile.DOCUMENT
  }

  public async openFile(attachedFile : ProjectClass.Local.AttachedFile) : Promise<void> {
    this.previewFileDialogVisibilty = true;
    this.previewedFile = attachedFile;

    if (this.isJSON(attachedFile)) {
      this.jsonContent = await this.getJSONContent(attachedFile.file!);
    }

    if (this.isText(attachedFile)) {
      this.textContent = await this.getTextContent(attachedFile.file!);
    }
  }

  public onDragEnter(event: DragEvent) : void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  public onDragOver(event: DragEvent) : void {
    event.preventDefault();
    event.stopPropagation();
  }

  public onDragLeave(event: DragEvent) : void {
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.target as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;
    
    if (!relatedTarget || !target.contains(relatedTarget)) {
      this.isDragging = false;
    }
  }

  public onDrop(event: DragEvent) : void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.verifyNewFile(files.item(0)!);
    }
  }

  public verifyNewFile(file : File) : void {
    if (!(file.type.includes('image') || file.type.includes('video') || file.type.includes('json') || file.type.includes('word') || file.type.includes('pdf') || file.type.includes('text') || file.type.includes('audio'))) {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: `Type de fichier non supporté.`,
        sticky: true,
      });
      return;
    }

    if (file?.size && file.size > MAX_FILE_SIZE) {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: `Taille de fichier dépassant les 10 Mo.`,
        sticky: true,
      });
      return;
    }
        
    const isDuplicate = this.attachedFiles.some(attachedFile => 
      attachedFile.file!.name === file.name &&
      attachedFile.file!.size === file.size &&
      attachedFile.file!.type === file.type
    );

    if (!isDuplicate) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.attachedFiles.push(new ProjectClass.Local.AttachedFile(
          {
            base64: e.target?.result as string,
            file: file
          }
        ));
      };
      reader.readAsDataURL(file);
    } else {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: `Le fichier a déjà été ajouté.`,
        sticky: true,
      })
    }
  }

  public async importFile() : Promise<void> {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/gif,image/webp,video/mp4,application/json,application/msword,application/pdf,text/*,audio/*';
    input.multiple = true;
    
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        Array.from(target.files).forEach(file => {
          this.verifyNewFile(file);
        });
      }
    };
  
    input.click();
  }

  public closeList(elementId : string) : void {
    const popover = document.getElementById(elementId);
    
    if (popover) {
      popover.hidePopover()
    }
  }

  public isPDF(attachedFile: ProjectClass.Local.AttachedFile) : boolean {
    return attachedFile.file?.type.includes("pdf") || false;
  }

  public isJSON(attachedFile: ProjectClass.Local.AttachedFile) : boolean {
    return attachedFile.file?.type.includes("json") || false;
  }

  public isText(attachedFile: ProjectClass.Local.AttachedFile) : boolean {
    return attachedFile.file?.type.includes("text") || false;
  }

  public getSafeUrl(file: File): SafeResourceUrl {
    const url = URL.createObjectURL(file);
    const urlWithToolbar = `${url}#toolbar=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(urlWithToolbar);
  }

  public async getJSONContent(file: File): Promise<string> {
    try {
      const content = await file.text();
      
      if (typeof content === 'object') {
        return JSON.stringify(content, null, 2);
      }

      const json = JSON.parse(content);
      return JSON.stringify(json, null, 2);
    } catch (error) {
      console.error('Erreur de parsing JSON:', error);
      return "";
    }
  }

  public getTextContent(file: File): Promise<string> {
    return file.text();
  }

  public formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  public openInNewTab(attachedFile: ProjectClass.Local.AttachedFile): void {
    const file = attachedFile?.file;
    if (!file) return;

    // Créer une URL blob pour le fichier
    const url = URL.createObjectURL(file);
    
    // Ouvrir dans un nouvel onglet
    window.open(url, '_blank');
    
    // Nettoyer l'URL après un délai pour libérer la mémoire
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    Object.keys(this.groups).forEach((groupKey) => {
      Object.keys(this.groups[groupKey].messages).forEach((messageKey) => {
        this.groups[groupKey].messages[messageKey].attachedFiles?.forEach(file => {
          if (file.file) {
            URL.revokeObjectURL(URL.createObjectURL(file.file));
          }
        })
      })
    })
  }
}